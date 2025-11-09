import { json } from '@sveltejs/kit';
import { categoryService } from '$lib/services';
import type { RequestHandler } from './$types';
import { getUserId } from '../../../../utils/session';

export const GET: RequestHandler = async (event) => {
	const userId = getUserId(event);
	const { id } = event.params;
	try {
		const category = await categoryService.getCategoryById(id, userId || undefined);

		if (!category) {
			return json(
				{
					success: false,
					error: 'Category not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: category
		});
	} catch (error) {
		console.error(`GET /api/categories/${id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	try {
		const { id } = params;
		const body = await request.json();

		const category = await categoryService.updateCategory(id, body);

		if (!category) {
			return json(
				{
					success: false,
					error: 'Category not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: category
		});
	} catch (error) {
		console.error(`PUT /api/categories/${params.id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	const userId = getUserId(event);
	const { params } = event;
	try {
		const { id } = params;

		if (!userId) {
			return json(
				{
					success: false,
					error: 'user_id parameter is required'
				},
				{ status: 400 }
			);
		}

		await categoryService.deleteCategory(id, userId);

		return json({
			success: true,
			message: 'Category deleted successfully'
		});
	} catch (error) {
		console.error(`DELETE /api/categories/${params.id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
