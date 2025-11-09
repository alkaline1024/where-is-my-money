import type { BaseModel } from './base';

export interface Category extends BaseModel {
	id: string;
	name: string;
	icon: string;
	color: string;
	user_id: string;
	created_at: string;
	updated_at: string;
}
