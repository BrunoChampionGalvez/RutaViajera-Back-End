import { Repository, DeepPartial } from 'typeorm';
import { ISeeder } from '../interfaces/seeder.interface';

export abstract class BaseSeeder<T> implements ISeeder {
  constructor(protected readonly repository: Repository<T>) {}

  abstract seed(): Promise<void>;
  abstract getName(): string;

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }

  protected async log(message: string): Promise<void> {
    console.log(`[${this.getName()}] ${message}`);
  }

  protected async createIfNotExists(entityData: DeepPartial<T>[], uniqueField?: keyof T): Promise<T[]> {
    const createdEntities: T[] = [];

    for (const data of entityData) {
      let entity: T;
      
      if (uniqueField && (data as any)[uniqueField]) {
        const existing = await this.repository.findOne({
          where: { [uniqueField]: (data as any)[uniqueField] } as any,
        });
        
        if (existing) {
          await this.log(`Skipping ${uniqueField.toString()}: ${(data as any)[uniqueField]} (already exists)`);
          createdEntities.push(existing);
          continue;
        }
      }

      entity = this.repository.create(data);
      const saved = await this.repository.save(entity);
      createdEntities.push(saved);
      await this.log(`Created entity with data`);
    }

    return createdEntities;
  }
}