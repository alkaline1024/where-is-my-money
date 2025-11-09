import { env } from '$env/dynamic/private';
import type { Transaction } from '$lib/models/transactions';
import { BaseRepository } from './base.repository';

export class TransactionRepository extends BaseRepository<Transaction> {
	constructor(tableName = env.DDB_TABLE_TRANSACTIONS) {
		super(tableName, 'transaction_id');
		if (!tableName) {
			throw new Error('DDB_TABLE_TRANSACTIONS environment variable is not set');
		}
	}

	/**
	 * ค้นหา transactions ตาม user_id
	 */
	async findByUserId(userId: string, limit?: number): Promise<Transaction[]> {
		return this.query(userId, {
			limit,
			indexName: 'user_id-date-index' // สมมติว่ามี GSI นี้
		});
	}

	/**
	 * ค้นหา transactions ตาม user_id และช่วงวันที่
	 */
	async findByUserIdAndDateRange(
		userId: string,
		startDate: string,
		endDate: string,
		limit?: number
	): Promise<Transaction[]> {
		return this.query(userId, {
			sortKeyCondition: {
				operator: 'between',
				value: startDate,
				value2: endDate
			},
			limit,
			indexName: 'user_id-date-index'
		});
	}

	/**
	 * ค้นหา transactions ตาม category_id
	 */
	async findByCategoryId(categoryId: string, limit?: number): Promise<Transaction[]> {
		return this.query(categoryId, {
			limit,
			indexName: 'category_id-date-index' // สมมติว่ามี GSI นี้
		});
	}

	/**
	 * ค้นหา transactions ตาม type (income/expense)
	 */
	async findByType(
		userId: string,
		type: 'income' | 'expense',
		limit?: number
	): Promise<Transaction[]> {
		return this.query(userId, {
			limit,
			indexName: 'user_id-type-index' // สมมติว่ามี GSI นี้
		});
	}

	/**
	 * คำนวณยอดรวมตาม type
	 */
	async getTotalByType(userId: string, type: 'income' | 'expense'): Promise<number> {
		const transactions = await this.findByType(userId, type);
		return transactions.reduce((total, transaction) => total + transaction.amount, 0);
	}

	/**
	 * คำนวณยอดคงเหลือ (income - expense)
	 */
	async getBalance(userId: string): Promise<number> {
		const [income, expense] = await Promise.all([
			this.getTotalByType(userId, 'income'),
			this.getTotalByType(userId, 'expense')
		]);
		return income - expense;
	}

	/**
	 * ค้นหา transactions ล่าสุด
	 */
	async findRecent(userId: string, limit = 10): Promise<Transaction[]> {
		const transactions = await this.findByUserId(userId);
		return transactions
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, limit);
	}
}
