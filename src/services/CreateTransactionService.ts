import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (value < 0) {
      throw new AppError(
        'Value cant be a negative number, change the type to "outcome"',
        400,
      );
    }

    if (type.toLowerCase() !== 'income' && type.toLowerCase() !== 'outcome') {
      throw new AppError('The type just can be a income or outcome', 400);
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError(
          'Transaction denied. The value is bigger than your wallet',
          400,
        );
      }
    }

    let checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(checkCategoryExists);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: checkCategoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
