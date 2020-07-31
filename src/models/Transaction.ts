import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column()
  value: number;

  @Column()
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;

/*
'INSERT INTO "transaction"("id", "title", "type", "value", "created_at", "updated_at", "category_id") VALUES (DEFAULT, $1, $2, $3, DEFAULT, DEFAULT, $4) RETURNING "id", "created_at", "updated_at"',
  parameters: [
    'Salário',
    'outcome',
    1200,
    'b48965f6-7e1b-42af-a242-0f4b281ca520'
  ]
*/
