import { json } from '@sveltejs/kit';
import { transactionService } from '$lib/services';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		const transaction = await transactionService.getTransactionById(id);

		if (!transaction) {
			return json(
				{
					success: false,
					error: 'Transaction not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: transaction
		});
	} catch (error) {
		console.error(`GET /api/transactions/${params.id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const body = await request.json();

		// Validate amount if provided
		if (body.amount !== undefined) {
			if (typeof body.amount !== 'number' || body.amount <= 0) {
				return json(
					{
						success: false,
						error: 'amount must be a positive number'
					},
					{ status: 400 }
				);
			}
		}

		// Validate type if provided
		if (body.type && !['income', 'expense'].includes(body.type)) {
			return json(
				{
					success: false,
					error: 'type must be either "income" or "expense"'
				},
				{ status: 400 }
			);
		}

		const transaction = await transactionService.updateTransaction(id, body);

		if (!transaction) {
			return json(
				{
					success: false,
					error: 'Transaction not found'
				},
				{ status: 404 }
			);
		}

		return json({
			success: true,
			data: transaction
		});
	} catch (error) {
		console.error(`PUT /api/transactions/${params.id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		await transactionService.deleteTransaction(id);

		return json({
			success: true,
			message: 'Transaction deleted successfully'
		});
	} catch (error) {
		console.error(`DELETE /api/transactions/${params.id} error:`, error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
