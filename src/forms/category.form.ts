import { z } from 'zod';

export const categoryFormSchema = z.object({
	name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่'),
	color: z.string().optional().nullable(),
	icon: z.string().optional().nullable()
});
