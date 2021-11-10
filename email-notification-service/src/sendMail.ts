import nodemailer, { SentMessageInfo } from "nodemailer";
import config from "./config";
import logger from "./logger";

const sendMail = async (emailAddresses: string | string[]) => {
  const transportOptions = {
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: config.smtpServer.secure,
    auth: {
      user: config.smtpServer.user,
      pass: config.smtpServer.password,
    },
  };
  logger.trace({ transportOptions }, "Sending email with transport options");
  const transporter = nodemailer.createTransport(transportOptions);

  const info: SentMessageInfo = await transporter.sendMail({
    from: config.email.from,
    to: emailAddresses,
    subject: config.email.subject,
    text: config.email.text,
  });

  logger.debug(`Message sent to ${emailAddresses}: ${info.messageId}`);
};
export default sendMail;
