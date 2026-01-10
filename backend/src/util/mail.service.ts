import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Mã xác nhận đăng ký',
        html: `
          <h2>Xác nhận email của bạn</h2>
          <p>Mã xác nhận của bạn là: <strong>${code}</strong></p>
          <p>Mã này sẽ hết hạn trong 1 phút</p>
        `,
      });
      return true;
    } catch (error) {
      console.error('Lỗi gửi email:', error);
      throw error;
    }
  }
}
