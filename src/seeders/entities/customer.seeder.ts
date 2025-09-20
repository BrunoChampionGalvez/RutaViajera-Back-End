import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customers } from '../../customers/customers.entity';
import { BaseSeeder } from '../base/base.seeder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerSeeder extends BaseSeeder<Customers> {
  constructor(
    @InjectRepository(Customers)
    repository: Repository<Customers>,
  ) {
    super(repository);
  }

  getName(): string {
    return 'CustomerSeeder';
  }

  async seed(): Promise<void> {
    const hashedPassword = await bcrypt.hash('Customer123!', 10);

    const customers = [
      {
        name: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        password: hashedPassword,
        phone: '+57 310 123 4567',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Calle 80 #15-25',
        birthDate: '1992-08-10',
        isAdmin: false,
      },
      {
        name: 'Sofia',
        lastName: 'Morales',
        email: 'sofia.morales@email.com',
        password: hashedPassword,
        phone: '+57 311 234 5678',
        country: 'Colombia',
        city: 'Cali',
        address: 'Avenida 6N #28-45',
        birthDate: '1994-12-03',
        isAdmin: false,
      },
      {
        name: 'Diego',
        lastName: 'Ramirez',
        email: 'diego.ramirez@email.com',
        password: hashedPassword,
        phone: '+57 312 345 6789',
        country: 'Colombia',
        city: 'Medellín',
        address: 'Carrera 45 #68-12',
        birthDate: '1989-04-18',
        isAdmin: false,
      },
      {
        name: 'Camila',
        lastName: 'López',
        email: 'camila.lopez@email.com',
        password: hashedPassword,
        phone: '+57 313 456 7890',
        country: 'Colombia',
        city: 'Barranquilla',
        address: 'Calle 72 #56-23',
        birthDate: '1996-09-27',
        isAdmin: false,
      },
      {
        name: 'Andrés',
        lastName: 'Herrera',
        email: 'andres.herrera@email.com',
        password: hashedPassword,
        phone: '+57 314 567 8901',
        country: 'Colombia',
        city: 'Bucaramanga',
        address: 'Carrera 35 #42-67',
        birthDate: '1991-01-15',
        isAdmin: false,
      },
    ];

    await this.createIfNotExists(customers, 'email');
    await this.log(`Seeded ${customers.length} customer(s)`);
  }
}