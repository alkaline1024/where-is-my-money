import { json } from '@sveltejs/kit';
import { transactionService } from '$lib/services';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		// ตรวจสอบ authentication
		if (!locals.session?.user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const userId = locals.session.user.id;
		if (!userId) {
			return json({ success: false, error: 'User ID not found' }, { status: 400 });
		}

		const limit = url.searchParams.get('limit');
		const type = url.searchParams.get('type') as 'income' | 'expense' | null;
		const categoryId = url.searchParams.get('category_id');

		const transactions = await transactionService.getUserTransactions(userId, {
			limit: limit ? parseInt(limit) : undefined,
			type: type || undefined,
			categoryId: categoryId || undefined
		});

		return json({
			success: true,
			data: transactions,
			count: transactions.length
		});
	} catch (error) {
		console.error('GET /api/transactions error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// ตรวจสอบ authentication
		if (!locals.session?.user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const userId = locals.session.user.id;
		if (!userId) {
			return json({ success: false, error: 'User ID not found' }, { status: 400 });
		}

		const body = await request.json();

		// Validate required fields (ไม่ต้องส่ง user_id ใน body แล้ว เอาจาก session)
		const requiredFields = ['type', 'amount', 'date', 'category_id'];
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

		// Validate type
		if (!['income', 'expense'].includes(body.type)) {
			return json(
				{
					success: false,
					error: 'type must be either "income" or "expense"'
				},
				{ status: 400 }
			);
		}

		// Validate amount
		if (typeof body.amount !== 'number' || body.amount <= 0) {
			return json(
				{
					success: false,
					error: 'amount must be a positive number'
				},
				{ status: 400 }
			);
		}

		const transaction = await transactionService.createTransaction({
			user_id: userId, // ใช้ user_id จาก session
			type: body.type,
			amount: body.amount,
			date: body.date,
			category_id: body.category_id,
			remarks: body.remarks
		});

		return json(
			{
				success: true,
				data: transaction
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('POST /api/transactions error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
