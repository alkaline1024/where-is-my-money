import type { BaseModel } from '$lib/repositories/base.repository';

export interface Category extends BaseModel {
	id: string;
	name: string;
	icon: string;
	color: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}
