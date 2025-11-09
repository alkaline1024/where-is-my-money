import { transactionRepository } from '$lib/repositories';
import type { Transaction } from '$lib/models/transactions';
import { nanoid } from 'nanoid';

export class TransactionService {
	/**
	 * สร้าง transaction ใหม่
	 */
	async createTransaction(data: {
		user_id: string;
		type: 'income' | 'expense';
		amount: number;
		date: string;
		category_id: string;
		remarks?: string;
	}): Promise<Transaction> {
		// Validate amount
		if (data.amount <= 0) {
			throw new Error('Amount must be greater than 0');
		}

		// Validate date format
		if (!this.isValidDate(data.date)) {
			throw new Error('Invalid date format. Use YYYY-MM-DD');
		}

		const transactionData = {
			transaction_id: nanoid(),
			...data,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};

		return transactionRepository.create(transactionData);
	}

	/**
	 * อัปเดต transaction
	 */
	async updateTransaction(
		transactionId: string,
		updates: Partial<{
			type: 'income' | 'expense';
			amount: number;
			date: string;
			category_id: string;
			remarks: string;
		}>
	): Promise<Transaction | null> {
		// Validate amount if provided
		if (updates.amount !== undefined && updates.amount <= 0) {
			throw new Error('Amount must be greater than 0');
		}

		// Validate date format if provided
		if (updates.date && !this.isValidDate(updates.date)) {
			throw new Error('Invalid date format. Use YYYY-MM-DD');
		}

		return transactionRepository.update(transactionId, updates);
	}

	/**
	 * ลบ transaction
	 */
	async deleteTransaction(transactionId: string): Promise<boolean> {
		return transactionRepository.delete(transactionId);
	}

	/**
	 * ดึง transaction ตาม ID
	 */
	async getTransactionById(transactionId: string): Promise<Transaction | null> {
		return transactionRepository.findById(transactionId);
	}

	/**
	 * ดึง transactions ของ user
	 */
	async getUserTransactions(
		userId: string,
		options?: {
			limit?: number;
			type?: 'income' | 'expense';
			categoryId?: string;
		}
	): Promise<Transaction[]> {
		if (options?.type) {
			return transactionRepository.findByType(userId, options.type, options.limit);
		}

		if (options?.categoryId) {
			const transactions = await transactionRepository.findByCategoryId(options.categoryId);
			return transactions.filter((t) => t.user_id === userId);
		}

		return transactionRepository.findByUserId(userId, options?.limit);
	}

	/**
	 * ดึง transactions ในช่วงวันที่
	 */
	async getTransactionsByDateRange(
		userId: string,
		startDate: string,
		endDate: string
	): Promise<Transaction[]> {
		if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
			throw new Error('Invalid date format. Use YYYY-MM-DD');
		}

		if (new Date(startDate) > new Date(endDate)) {
			throw new Error('Start date must be before end date');
		}

		return transactionRepository.findByUserIdAndDateRange(userId, startDate, endDate);
	}

	/**
	 * ดึง transactions ล่าสุด
	 */
	async getRecentTransactions(userId: string, limit = 10): Promise<Transaction[]> {
		return transactionRepository.findRecent(userId, limit);
	}

	/**
	 * คำนวณสถิติการเงิน
	 */
	async getFinancialStats(userId: string): Promise<{
		totalIncome: number;
		totalExpense: number;
		balance: number;
		savingsRate: number;
		transactionCount: {
			income: number;
			expense: number;
			total: number;
		};
	}> {
		const [totalIncome, totalExpense, allTransactions] = await Promise.all([
			transactionRepository.getTotalByType(userId, 'income'),
			transactionRepository.getTotalByType(userId, 'expense'),
			transactionRepository.findByUserId(userId)
		]);

		const balance = totalIncome - totalExpense;
		const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

		const incomeCount = allTransactions.filter((t) => t.type === 'income').length;
		const expenseCount = allTransactions.filter((t) => t.type === 'expense').length;

		return {
			totalIncome,
			totalExpense,
			balance,
			savingsRate: Math.round(savingsRate * 100) / 100,
			transactionCount: {
				income: incomeCount,
				expense: expenseCount,
				total: allTransactions.length
			}
		};
	}

	/**
	 * ดึงสถิติรายเดือน
	 */
	async getMonthlyStats(
		userId: string,
		year: number,
		month: number
	): Promise<{
		income: number;
		expense: number;
		balance: number;
		transactions: Transaction[];
	}> {
		const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
		const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

		const transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);

		const income = transactions
			.filter((t) => t.type === 'income')
			.reduce((sum, t) => sum + t.amount, 0);

		const expense = transactions
			.filter((t) => t.type === 'expense')
			.reduce((sum, t) => sum + t.amount, 0);

		return {
			income,
			expense,
			balance: income - expense,
			transactions
		};
	}

	/**
	 * ตรวจสอบรูปแบบวันที่
	 */
	private isValidDate(dateString: string): boolean {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(dateString)) return false;

		const date = new Date(dateString);
		return date instanceof Date && !isNaN(date.getTime());
	}
}

// Export singleton instance
export const transactionService = new TransactionService();
