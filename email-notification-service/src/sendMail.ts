import nodemailer, { SentMessageInfo } from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import * as Mail from "nodemailer/lib/mailer";
import config from "./config";
import logger from "./logger";

const sendMail = async (emailAddresses: string | string[]): Promise<void> => {
  const transportOptions: SMTPTransport.Options = {
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: config.smtpServer.secure,
    auth: {
      user: config.smtpServer.user,
      pass: config.smtpServer.password,
    },
  };
  try {
    logger.debug({ transportOptions }, "Sending email with transport options");
    const transporter = nodemailer.createTransport(transportOptions);

    const info: SentMessageInfo = await transporter.sendMail({
      from: config.email.from,
      to: emailAddresses,
      subject: config.email.subject,
      text: config.email.text,
    } as Mail.Options);

    logger.info(`Email sent to ${emailAddresses}: ${info.messageId}`);
  } catch (error) {
    logger.error(`Failed to send email to ${emailAddresses}: ${error}`);
    throw error; // maybe handle it higher on call stack
  }
};
export default sendMail;
