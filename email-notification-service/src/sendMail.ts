import nodemailer, { SentMessageInfo } from "nodemailer";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import * as Mail from "nodemailer/lib/mailer";
import config from "./config";
import logger from "./logger";

const sendMail = async (emailAddresses: string | string[]) => {
  const transportOptions: SMTPTransport.Options = {
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: config.smtpServer.secure,
    auth: {
      user: config.smtpServer.user,
      pass: config.smtpServer.password,
    },
    // connectionTimeout: 5000,
    // greetingTimeout: 5000,
  };
  logger.info({ transportOptions }, "Sending email with transport options");
  const transporter = nodemailer.createTransport(transportOptions);
  // verify connection configuration
  // logger.info("Verifying SMTP connection...");
  // transporter.verify(function (error, success) {
  //   if (error) {
  //     logger.error(error);
  //   } else {
  //     logger.info("Server is ready to take our messages");
  //   }
  // });

  logger.info(`from: ${config.email.from}`);
  logger.info(`to: ${emailAddresses}`);
  const info: SentMessageInfo = await transporter.sendMail({
    from: config.email.from,
    to: emailAddresses,
    subject: config.email.subject,
    text: config.email.text,
  } as Mail.Options);

  logger.info(`Message sent to ${emailAddresses}: ${info.messageId}`);
};
export default sendMail;
