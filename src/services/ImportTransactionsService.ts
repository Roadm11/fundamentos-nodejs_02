import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CsvTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepositories = getRepository(Category);

    const readCsvStreamTransactions = fs.createReadStream(filePath);
    const parseStream = csvParse({
      from_line: 2,
    });

    const transactions: CsvTransactions[] = [];
    const categories: string[] = [];

    const parseCsv = readCsvStreamTransactions.pipe(parseStream);

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCsv.on('end', resolve);
    });

    const existCategories = await categoriesRepositories.find({
      where: { title: In(categories) },
    });

    const existCategoriesTitles = existCategories.map(
      (category: Category) => category.title,
    );

    const categoriesFiltered = categories
      .filter(category => !existCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepositories.create(
      categoriesFiltered.map(title => ({
        title,
      })),
    );

    await categoriesRepositories.save(newCategories);

    const finalCategories = [...newCategories, ...existCategories];

    const createTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(filePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
