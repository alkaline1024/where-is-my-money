import type { BaseModel } from '$lib/models/base';
import { dynamoDB } from '$lib/aws/dynamodb';
import { v7 as uuidv7 } from 'uuid';
import type { DeleteCommandInput, GetCommandInput, QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export type GlobalSecondaryIndex = {
	name: string;
	primaryKey: string;
	sortKey?: string;
};

export abstract class BaseRepository<
	T extends BaseModel,
	GSI extends { indexName: string; partitionKey: string }[]
> {
	protected tableName: string;
	protected primaryKey: string;
	protected sortKey?: string;

	constructor(tableName: string, primaryKey: string, sortKey?: string) {
		this.tableName = tableName;
		this.primaryKey = primaryKey;
		this.sortKey = sortKey;
	}

	/**
	 * แปลง model เป็น DynamoDB item format
	 */
	protected modelToItem(model: T): Record<string, unknown> {
		return {
			...model,
			created_at: model.created_at || new Date().toISOString(),
			updated_at: new Date().toISOString()
		} as Record<string, unknown>;
	}

	/**
	 * แปลง DynamoDB item เป็น model format
	 */
	protected itemToModel(item: Record<string, unknown>): T {
		return item as T;
	}

	/**
	 * สร้างหรืออัปเดตรายการ
	 */
	async create(model: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
		const item = this.modelToItem({
			...model,
			id: uuidv7(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		} as T);

		const command = {
			TableName: this.tableName,
			Item: item
		};

		await dynamoDB.put(command);
		return this.itemToModel(item);
	}

	/**
	 * ค้นหารายการด้วย primary key (และ sort key ถ้ามี)
	 */
	async findById(id: string, sortKeyValue?: string): Promise<T | null> {
		const key: Record<string, unknown> = {
			[this.primaryKey]: id
		};

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		const command: GetCommandInput = {
			TableName: this.tableName,
			Key: key
		};

		const result = await dynamoDB.get(command);
		return result.Item ? this.itemToModel(result.Item) : null;
	}

	/**
	 * อัปเดตรายการ
	 */
	async update(
		id: string,
		updates: Partial<Omit<T, 'created_at'>>,
		sortKeyValue?: string
	): Promise<T | null> {
		const key: Record<string, unknown> = {
			[this.primaryKey]: id
		};

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		// สร้าง UpdateExpression และ ExpressionAttributeValues
		const updateExpressions: string[] = [];
		const expressionAttributeValues: Record<string, unknown> = {};
		const expressionAttributeNames: Record<string, string> = {};

		Object.entries(updates).forEach(([key, value], index) => {
			const valueKey = `:val${index}`;
			const nameKey = `#attr${index}`;

			updateExpressions.push(`#attr${index} = :val${index}`);
			expressionAttributeValues[valueKey] = value;
			expressionAttributeNames[nameKey] = key;
		});

		// เพิ่ม updated_at
		updateExpressions.push('#updatedAt = :updatedAt');
		expressionAttributeValues[':updatedAt'] = new Date().toISOString();
		expressionAttributeNames['#updatedAt'] = 'updated_at';

		const command = {
			TableName: this.tableName,
			Key: key,
			UpdateExpression: `SET ${updateExpressions.join(', ')}`,
			ExpressionAttributeValues: expressionAttributeValues,
			ExpressionAttributeNames: expressionAttributeNames,
			ReturnValues: 'ALL_NEW' as const
		};

		const result = await dynamoDB.update(command);
		return result.Attributes ? this.itemToModel(result.Attributes) : null;
	}

	/**
	 * ลบรายการ
	 */
	async delete(id: string, sortKeyValue?: string): Promise<boolean> {
		const key: Record<string, unknown> = {
			[this.primaryKey]: id
		};

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		const command: DeleteCommandInput = {
			TableName: this.tableName,
			Key: key
		};

		await dynamoDB.delete(command);
		return true;
	}

	/**
	 * ค้นหาทั้งหมด (ระวังใช้กับ table ใหญ่)
	 */
	async findAll(limit?: number): Promise<T[]> {
		const command: {
			TableName: string;
			Limit?: number;
		} = {
			TableName: this.tableName
		};

		if (limit) {
			command.Limit = limit;
		}

		const result = await dynamoDB.scan(command);
		return result.Items ? result.Items.map((item) => this.itemToModel(item)) : [];
	}

	/**
	 * Query
	 * partitionOptions
	 * - string: หมายถึง query ด้วย primary key ของ table
	 * - GlobalSecondaryIndex: หมายถึง query ด้วย GSI ที่ระบุ
	 */
	async query(
		partitionOptions:
			| (string | number | boolean)
			| (GSI[number] & {
					partitionKeyValue: unknown;
			  }),
		options?: {
			sortKeyCondition?: {
				operator: 'begins_with' | '=' | '<' | '<=' | '>' | '>=' | 'between';
				value: unknown;
				value2?: unknown; // สำหรับ between
				reverse?: boolean;
			};
			limit?: number;
		}
	): Promise<T[]> {
		let indexName: string | undefined;
		let partitionKeyName = '';
		let partitionKeyValue: unknown;
		if (typeof partitionOptions !== 'object') {
			partitionKeyName = this.primaryKey;
			partitionKeyValue = partitionOptions;
		} else {
			indexName = partitionOptions.indexName;
			partitionKeyName = partitionOptions.partitionKey;
			partitionKeyValue = partitionOptions.partitionKeyValue;
		}

		let keyConditionExpression = `#pk = :pk`;
		const expressionAttributeNames: Record<string, string> = {
			'#pk': partitionKeyName
		};
		const expressionAttributeValues: Record<string, unknown> = {
			':pk': partitionKeyValue
		};
		// เพิ่ม sort key condition ถ้ามี
		if (options?.sortKeyCondition && this.sortKey) {
			expressionAttributeNames['#sk'] = this.sortKey;

			switch (options.sortKeyCondition.operator) {
				case 'begins_with':
					keyConditionExpression += ` AND begins_with(#sk, :sk)`;
					expressionAttributeValues[':sk'] = options.sortKeyCondition.value;
					break;
				case 'between':
					keyConditionExpression += ` AND #sk BETWEEN :sk1 AND :sk2`;
					expressionAttributeValues[':sk1'] = options.sortKeyCondition.value;
					expressionAttributeValues[':sk2'] = options.sortKeyCondition.value2;
					break;
				default:
					keyConditionExpression += ` AND #sk ${options.sortKeyCondition.operator} :sk`;
					expressionAttributeValues[':sk'] = options.sortKeyCondition.value;
			}
		}

		const command: QueryCommandInput = {
			IndexName: indexName,
			TableName: this.tableName,
			KeyConditionExpression: keyConditionExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: expressionAttributeValues,
			ScanIndexForward: options?.sortKeyCondition?.reverse ? false : true
		};

		if (options?.limit) {
			command.Limit = options.limit;
		}

		const result = await dynamoDB.query(command);
		return result.Items ? result.Items.map((item) => this.itemToModel(item)) : [];
	}
}
