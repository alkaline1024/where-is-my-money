import { env } from '$env/dynamic/private';
import type { CreateModelDTO } from '$lib/dto/base';
import type { Category } from '$lib/models/categories';
import { BaseRepository } from './base.repository';

export class CategoryRepository extends BaseRepository<
	Category,
	[{ indexName: 'user_id-name-index'; partitionKey: 'user_id' }]
> {
	constructor(tableName = env.DDB_TABLE_CATEGORIES) {
		super(tableName, 'id', 'name');
		if (!tableName) {
			throw new Error('DDB_TABLE_TRANSACTIONS environment variable is not set');
		}
	}

	/**
	 * ค้นหา categories ตาม user_id
	 */
	async findByUserId(userId: string, limit?: number): Promise<Category[]> {
		return this.query(
			{
				indexName: 'user_id-name-index',
				partitionKey: 'user_id',
				partitionKeyValue: userId
			},
			{ limit }
		);
	}

	/**
	 * ค้นหา category ตามชื่อ
	 */
	async findByName(userId: string, name: string): Promise<Category | null> {
		const categories = await this.findByUserId(userId);
		return (
			categories.find((category) => category.name.toLowerCase() === name.toLowerCase()) || null
		);
	}

	/**
	 * ตรวจสอบว่าชื่อ category ซ้ำหรือไม่
	 */
	async isNameExists(userId: string, name: string, excludeCategoryId?: string): Promise<boolean> {
		const existingCategory = await this.findByName(userId, name);
		if (!existingCategory) return false;

		// ถ้าระบุ excludeCategoryId แล้วพบ category ที่มี ID เดียวกัน แสดงว่าไม่ซ้ำ
		if (excludeCategoryId && existingCategory.category_id === excludeCategoryId) {
			return false;
		}

		return true;
	}

	/**
	 * สร้าง category ใหม่ (ตรวจสอบชื่อซ้ำก่อน)
	 */
	async createCategory(categoryData: CreateModelDTO<Category>): Promise<Category> {
		const isExists = await this.isNameExists(
			categoryData.user_id as string,
			categoryData.name as string
		);
		if (isExists) {
			throw new Error(`Category with name "${categoryData.name}" already exists`);
		}

		return this.create(categoryData);
	}

	/**
	 * อัปเดต category (ตรวจสอบชื่อซ้ำก่อน)
	 */
	async updateCategory(
		categoryId: string,
		updates: Partial<Omit<Category, 'category_id' | 'created_at' | 'updated_at'>>
	): Promise<Category | null> {
		// ถ้ามีการเปลี่ยนชื่อ ให้ตรวจสอบซ้ำ
		if (updates.name && updates.user_id) {
			const isExists = await this.isNameExists(
				updates.user_id as string,
				updates.name as string,
				categoryId
			);
			if (isExists) {
				throw new Error(`Category with name "${updates.name}" already exists`);
			}
		}

		return this.update(categoryId, updates);
	}

	/**
	 * ค้นหา categories ที่เรียงตามชื่อ
	 */
	async findByUserIdSorted(userId: string): Promise<Category[]> {
		const categories = await this.findByUserId(userId);
		return categories.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * ค้นหา categories ตามสี
	 */
	async findByColor(userId: string, color: string): Promise<Category[]> {
		const categories = await this.findByUserId(userId);
		return categories.filter((category) => category.color === color);
	}

	/**
	 * ค้นหา categories ตาม icon
	 */
	async findByIcon(userId: string, icon: string): Promise<Category[]> {
		const categories = await this.findByUserId(userId);
		return categories.filter((category) => category.icon === icon);
	}
}
