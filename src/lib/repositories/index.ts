export { BaseRepository } from './base.repository';
export { TransactionRepository } from './transaction.repository';
export { CategoryRepository } from './category.repository';

// Repository instances (singleton pattern)
import { TransactionRepository } from './transaction.repository';
import { CategoryRepository } from './category.repository';

export const transactionRepository = new TransactionRepository();
export const categoryRepository = new CategoryRepository();
