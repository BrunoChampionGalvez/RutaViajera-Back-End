import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelAdmins } from '../../hotel-admins/hotelAdmins.entity';
import { BaseSeeder } from '../base/base.seeder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HotelAdminSeeder extends BaseSeeder<HotelAdmins> {
  constructor(
    @InjectRepository(HotelAdmins)
    repository: Repository<HotelAdmins>,
  ) {
    super(repository);
  }

  getName(): string {
    return 'HotelAdminSeeder';
  }

  async seed(): Promise<void> {
    const hashedPassword = await bcrypt.hash('HotelAdmin123!', 10);

    const hotelAdmins = [
      {
        name: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos.rodriguez@hotelpalace.com',
        password: hashedPassword,
        phone: '+57 300 123 4567',
        country: 'Colombia',
        city: 'Bogotá',
        address: 'Carrera 13 #26-62',
        birthDate: '1985-03-15',
        numberOfHotels: 0,
        isAdmin: true,
      },
      {
        name: 'Maria',
        lastName: 'Gonzalez',
        email: 'maria.gonzalez@granhotel.com',
        password: hashedPassword,
        phone: '+57 301 987 6543',
        country: 'Colombia',
        city: 'Medellín',
        address: 'Carrera 70 #52-20',
        birthDate: '1990-07-22',
        numberOfHotels: 0,
        isAdmin: true,
      },
      {
        name: 'Luis',
        lastName: 'Martinez',
        email: 'luis.martinez@coastalresort.com',
        password: hashedPassword,
        phone: '+57 302 456 7890',
        country: 'Colombia',
        city: 'Cartagena',
        address: 'Avenida San Martín #45-12',
        birthDate: '1988-11-08',
        numberOfHotels: 0,
        isAdmin: true,
      },
      {
        name: 'Ana',
        lastName: 'Torres',
        email: 'ana.torres@mountainlodge.com',
        password: hashedPassword,
        phone: '+57 303 789 0123',
        country: 'Colombia',
        city: 'Manizales',
        address: 'Carrera 25 #64-30',
        birthDate: '1987-05-14',
        numberOfHotels: 0,
        isAdmin: true,
      },
    ];

    await this.createIfNotExists(hotelAdmins, 'email');
    await this.log(`Seeded ${hotelAdmins.length} hotel admin(s)`);
  }
}