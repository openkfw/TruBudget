import nodemailer from "nodemailer";
import config from "./config";

const sendMail = async (emails: string | string[]) => {
  const transporter = nodemailer.createTransport({
    host: config.smtpServer.host,
    port: config.smtpServer.port,
    secure: false,
  });

  const info = await transporter.sendMail({
    from: '"Trubudget Notification Service👻" <trubudget@notification.com>',
    to: emails,
    subject: "Trubudget Notificaiton",
    text: "You have received a notification.",
    // html: "<b>html example</b>"
  });

  // messageId: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  console.log(`Message sent to ${emails}: ${info.messageId}`);
};
export default sendMail;
