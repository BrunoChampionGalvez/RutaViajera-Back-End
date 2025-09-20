import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { CreateCustomerDto } from 'src/customers/customers.dto';
import * as path from 'path';
import * as fs from 'fs';
import { CreateHotelAdminDto } from 'src/hotel-admins/hotel-admin.dto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('MAIL');
    const pass = this.configService.get<string>('PASS');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user, pass },
      });
      this.logger.log('Mail transporter initialized');
    } else {
      this.logger.warn(
        'MAIL / PASS environment variables are not set. Emails will NOT be sent. Set MAIL and PASS (Gmail App Password).'
      );
    }
  }
  async sendMail(to: string, subject: string, text: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`Skipped sending email to ${to} (mail disabled)`);
      return { skipped: true } as any;
    }
    const mailOptions = {
      from: 'projectmgray@gmail.com',
      to: to,
      subject: subject,
      text: text,
      html: html,
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
      return info;
    } catch (error) {
      this.logger.error(`Error al enviar el correo: ${error}`);
      // Do not rethrow to avoid breaking main flow (e.g., signup)
      return { error: true } as any;
    }
  }

  async sendWelcomeEmailforCustomer(customer: CreateCustomerDto) {
    const emailTemplatePath = path.join(
      __dirname,
      '../../correos-nodemailer/registerUser/index.html',
    );

    let htmlTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    htmlTemplate = htmlTemplate.replace('[Nombre del Usuario]', customer.name);

    await this.sendMail(
      customer.email,
      'Bienvenido a Ruta Viajera',
      'Gracias por registarte en nuestra plataforma',
      htmlTemplate,
    );
  }

  async sendWelcomeEmailForHotelAdmin(hotelAdmin: CreateHotelAdminDto) {
    const emailTemplatePath = path.join(
      __dirname,
      '../../correos-nodemailer/registerHotelier/index.html',
    );

    let htmlTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    htmlTemplate = htmlTemplate.replace(
      '[Nombre del Usuario]',
      hotelAdmin.name,
    );

    await this.sendMail(
      hotelAdmin.email,
      'Bienvenido a Ruta Viajera',
      'Gracias por registarte en nuestra plataforma',
      htmlTemplate,
    );
  }
}
