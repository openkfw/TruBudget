import nodemailer, { SentMessageInfo } from "nodemailer";
import config from "./config";
import logger from "./logger";

const sendMail = async (emailAddresses: string | string[]) => {
  const transporter = nodemailer.createTransport({
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: config.smtpServer.secure,
    auth: {
      user: config.smtpServer.user,
      pass: config.smtpServer.password,
    },
  });

  const info: SentMessageInfo = await transporter.sendMail({
    from: config.email.from,
    to: emailAddresses,
    subject: config.email.subject,
    text: config.email.text,
  });

  logger.debug(`Message sent to ${emailAddresses}: ${info.messageId}`);
};
export default sendMail;
