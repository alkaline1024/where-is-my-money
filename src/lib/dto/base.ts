export type CreateModelDTO<T> = {
	[P in keyof T as P extends 'id' | 'created_at' | 'updated_at' ? never : P]: T[P];
};
