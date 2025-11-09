import type { BaseModel } from '$lib/repositories/base.repository';

export interface Transaction extends BaseModel {
	id: string;
	type: 'income' | 'expense';
	amount: number;
	date: string;
	category_id: string;
	remarks?: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}
