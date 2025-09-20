import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperAdmins } from '../../super-admin/superAdmin.entity';
import { BaseSeeder } from '../base/base.seeder';
import * as bcrypt from 'bcrypt';

/*
  InitialAdminSeeder
  - Crea (si no existe) un super admin con credenciales predeterminadas.
  - Idempotente: se puede ejecutar múltiples veces sin duplicar.
  - Email: admin@mail.com
  - Password: Test*1234!
*/
@Injectable()
export class InitialAdminSeeder extends BaseSeeder<SuperAdmins> {
  constructor(
    @InjectRepository(SuperAdmins)
    repository: Repository<SuperAdmins>,
  ) {
    super(repository);
  }

  getName(): string {
    return 'InitialAdminSeeder';
  }

  // Este seeder debe correr aunque ya existan otros super admins; solo se omite si el específico ya está.
  async shouldRun(): Promise<boolean> {
    const existing = await this.repository.findOne({ where: { email: 'admin@mail.com' } });
    return !existing; // corre solo si falta
  }

  async seed(): Promise<void> {
    const email = 'admin@mail.com';
    const passwordPlain = 'Test*1234!';
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    const adminData = [
      {
        name: 'Primary Admin',
        email,
        password: hashedPassword,
        superAdmin: true,
      },
    ];

    await this.createIfNotExists(adminData, 'email');
    await this.log(`Seeded initial admin (${email})`);
  }
}
