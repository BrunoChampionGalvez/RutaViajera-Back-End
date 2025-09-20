import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdmins } from '../../super-admin/superAdmin.entity';
import { BaseSeeder } from '../base/base.seeder';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminSeeder extends BaseSeeder<SuperAdmins> {
  constructor(
    @InjectRepository(SuperAdmins)
    repository: Repository<SuperAdmins>,
  ) {
    super(repository);
  }

  getName(): string {
    return 'SuperAdminSeeder';
  }

  async seed(): Promise<void> {
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

    const superAdmins = [
      {
        name: 'System Administrator',
        email: 'admin@rutaviajera.com',
        password: hashedPassword,
        superAdmin: true,
      },
      {
        name: 'Main Administrator',
        email: 'superadmin@rutaviajera.com',
        password: hashedPassword,
        superAdmin: true,
      },
    ];

    await this.createIfNotExists(superAdmins, 'email');
    await this.log(`Seeded ${superAdmins.length} super admin(s)`);
  }
}