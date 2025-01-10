// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail 'less secure app' option
  });
  //2) define a email options
  const mailOptions = {
    from: 'Akash Patle <Akashpatle.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //3) actually send the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
