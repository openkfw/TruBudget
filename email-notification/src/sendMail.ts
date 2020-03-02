import nodemailer, { SentMessageInfo } from "nodemailer";
import config from "./config";
import logger from "./logger";

const sendMail = async (emails: string | string[]) => {
  const transporter = nodemailer.createTransport({
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: false,
    // TODO:
    // simple auth
    // user:
    // password:
  });

  // TODO: should be configurable
  const info: SentMessageInfo = await transporter.sendMail({
    from: '"Trubudget Notification Service👻" <trubudget@notification.com>',
    to: emails,
    subject: "Trubudget Notificaiton",
    text: "You have received a notification.",
    // html: "<b>html example</b>"
  });

  // messageId: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  logger.debug(`Message sent to ${emails}: ${info.messageId}`);
};
export default sendMail;
