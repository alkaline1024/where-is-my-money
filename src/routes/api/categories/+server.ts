import { json } from '@sveltejs/kit';
import { categoryService } from '$lib/services';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('user_id');
		if (!userId) {
			return new Response('user_id parameter is required', { status: 400 });
		}

		const sortBy = url.searchParams.get('sort_by') as 'name' | 'created_at' | 'updated_at' | null;
		const sortOrder = url.searchParams.get('sort_order') as 'asc' | 'desc' | null;
		const color = url.searchParams.get('color');
		const icon = url.searchParams.get('icon');

		const categories = await categoryService.getUserCategories(userId, {
			sortBy: sortBy || undefined,
			sortOrder: sortOrder || undefined,
			color: color || undefined,
			icon: icon || undefined
		});

		return json({
			success: true,
			data: categories,
			count: categories.length
		});
	} catch (error) {
		console.error('GET /api/categories error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate required fields
		const requiredFields = ['user_id', 'name', 'icon', 'color'];
		for (const field of requiredFields) {
			if (!body[field]) {
				return json(
					{
						success: false,
						error: `${field} is required`
					},
					{ status: 400 }
				);
			}
		}

		const category = await categoryService.createCategory({
			user_id: body.user_id,
			name: body.name,
			icon: body.icon,
			color: body.color
		});

		return json(
			{
				success: true,
				data: category
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('POST /api/categories error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
