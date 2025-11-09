import { categoryRepository } from '$lib/repositories';
import type { Category } from '$lib/models/categories';
import type { CreateModelDTO } from '$lib/dto/base';

export class CategoryService {
	/**
	 * สร้าง category ใหม่
	 */
	async createCategory(data: CreateModelDTO<Category>): Promise<Category> {
		// Validate input
		this.validateCategoryData(data);
		return categoryRepository.createCategory(data);
	}

	/**
	 * อัปเดต category
	 */
	async updateCategory(
		categoryId: string,
		updates: {
			name: string;
			icon?: string;
			color?: string;
		}
	): Promise<Category | null> {
		this.validateCategoryData(updates);
		return categoryRepository.updateCategory(categoryId, updates);
	}

	/**
	 * ลบ category
	 */
	async deleteCategory(categoryId: string, userId: string): Promise<boolean> {
		// ตรวจสอบว่า category มีอยู่และเป็นของ user
		const category = await categoryRepository.findById(categoryId);
		if (!category) {
			throw new Error('Category not found');
		}

		if (category.user_id !== userId) {
			throw new Error('Unauthorized to delete this category');
		}

		// TODO: ตรวจสอบว่าไม่มี transactions ที่ใช้ category นี้
		// จะต้องมี transaction service เพื่อเช็ค

		return categoryRepository.delete(categoryId);
	}

	/**
	 * ดึง category ตาม ID
	 */
	async getCategoryById(categoryId: string, userId?: string): Promise<Category | null> {
		const category = await categoryRepository.findById(categoryId);

		// ถ้าระบุ userId ให้ตรวจสอบสิทธิ์
		if (category && userId && category.user_id !== userId) {
			throw new Error('Unauthorized to access this category');
		}

		return category;
	}

	/**
	 * ดึง categories ของ user
	 */
	async getUserCategories(
		userId: string,
		options?: {
			sortBy?: 'name' | 'created_at' | 'updated_at';
			sortOrder?: 'asc' | 'desc';
			color?: string;
			icon?: string;
		}
	): Promise<Category[]> {
		let categories: Category[];

		if (options?.color) {
			categories = await categoryRepository.findByColor(userId, options.color);
		} else if (options?.icon) {
			categories = await categoryRepository.findByIcon(userId, options.icon);
		} else {
			categories = await categoryRepository.findByUserId(userId);
		}

		// เรียงลำดับ
		if (options?.sortBy) {
			categories = this.sortCategories(categories, options.sortBy, options.sortOrder);
		} else {
			// เรียงตามชื่อเป็นค่าเริ่มต้น
			categories = categories.sort((a, b) => a.name.localeCompare(b.name));
		}

		return categories;
	}

	/**
	 * ค้นหา category ตามชื่อ
	 */
	async findCategoryByName(userId: string, name: string): Promise<Category | null> {
		return categoryRepository.findByName(userId, name);
	}

	/**
	 * ตรวจสอบว่าชื่อ category ซ้ำหรือไม่
	 */
	async isCategoryNameExists(
		userId: string,
		name: string,
		excludeCategoryId?: string
	): Promise<boolean> {
		return categoryRepository.isNameExists(userId, name, excludeCategoryId);
	}

	/**
	 * ดึงสถิติการใช้งาน categories
	 */
	async getCategoryStats(userId: string): Promise<{
		totalCategories: number;
		categoriesByColor: Record<string, number>;
		categoriesByIcon: Record<string, number>;
		recentlyCreated: Category[];
	}> {
		const categories = await categoryRepository.findByUserId(userId);

		// นับตามสี
		const categoriesByColor: Record<string, number> = {};
		categories.forEach((cat) => {
			categoriesByColor[cat.color] = (categoriesByColor[cat.color] || 0) + 1;
		});

		// นับตามไอคอน
		const categoriesByIcon: Record<string, number> = {};
		categories.forEach((cat) => {
			categoriesByIcon[cat.icon] = (categoriesByIcon[cat.icon] || 0) + 1;
		});

		// Categories ที่สร้างล่าสุด
		const recentlyCreated = categories
			.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
			.slice(0, 5);

		return {
			totalCategories: categories.length,
			categoriesByColor,
			categoriesByIcon,
			recentlyCreated
		};
	}

	/**
	 * ดึง categories ที่ใช้บ่อย (ต้องมี transaction data)
	 */
	async getPopularCategories(
		userId: string,
		limit = 5
	): Promise<
		{
			category: Category;
			transactionCount: number;
		}[]
	> {
		// TODO: Implement when transaction service is available
		// For now, return all categories
		const categories = await categoryRepository.findByUserId(userId);
		return categories.slice(0, limit).map((category) => ({
			category,
			transactionCount: 0 // placeholder
		}));
	}

	/**
	 * Validate category data
	 */
	private validateCategoryData(data: { name: string; icon?: string; color?: string }): void {
		this.validateName(data.name);
		this.validateColor(data.color);
	}

	/**
	 * Validate category name
	 */
	private validateName(name: string): void {
		if (!name || typeof name !== 'string') {
			throw new Error('Category name is required');
		}

		if (name.trim().length === 0) {
			throw new Error('Category name cannot be empty');
		}

		if (name.length > 50) {
			throw new Error('Category name must be 50 characters or less');
		}
	}

	/**
	 * Validate category color
	 */
	private validateColor(color: string | undefined): void {
		if (color === undefined || color === null) {
			return;
		}
		if (typeof color !== 'string') {
			throw new Error('Category color must be a string');
		}
		// Check if it's a valid hex color
		const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		if (!hexColorRegex.test(color)) {
			throw new Error('Category color must be a valid hex color (e.g., #FF0000)');
		}
	}

	/**
	 * Sort categories
	 */
	private sortCategories(
		categories: Category[],
		sortBy: 'name' | 'created_at' | 'updated_at',
		sortOrder: 'asc' | 'desc' = 'asc'
	): Category[] {
		return categories.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'created_at':
					comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
					break;
				case 'updated_at':
					comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
					break;
			}

			return sortOrder === 'desc' ? -comparison : comparison;
		});
	}
}

// Export singleton instance
export const categoryService = new CategoryService();
