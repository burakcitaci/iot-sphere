import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('traces')
export class Trace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  traceId!: string;

  @Column()
  name!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column()
  duration!: number;

  @Column()
  status!: string;

  @Column({ type: 'jsonb' })
  spans!: any[];

  @Column({ type: 'jsonb' })
  metadata!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
} 