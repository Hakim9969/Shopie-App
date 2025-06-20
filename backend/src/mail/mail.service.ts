import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as ejs from 'ejs';

const nodemailer = require('nodemailer');
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private templatesPath: string;

  constructor(private readonly configService: ConfigService) {
    this.templatesPath = path.join(process.cwd(), 'src/mail/templates/email');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('MAIL_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Mailer transporter initialized');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM', 'Shopie <no-reply@shopie.com>'),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    }
  }

  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${templateName}" not found at ${templatePath}`);
    }

    const templateOptions = {
      filename: templatePath,
      cache: false,
      compileDebug: true,
    };

    return ejs.renderFile(templatePath, context, templateOptions);
  }

  async sendOrderConfirmationEmail(
  to: string,
  orderId: number,
  total: number,
  products: { name: string; quantity: number }[],
): Promise<void> {
  const context = {
    orderId,
    total,
    products,
  };

  await this.sendEmail({
    to,
    subject: `Order Confirmation - Order #${orderId}`,
    template: 'order-confirmation',
    context,
  });
}

}
