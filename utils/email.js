// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
const pug = require('pug');
// eslint-disable-next-line import/no-extraneous-dependencies
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Akash Patle <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //sendgrid
      return nodemailer.createTransport({
        host: process.env.POSTMARK_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.POSTMARK_SERVER_TOKEN, // Postmark API Token
          pass: process.env.POSTMARK_SERVER_TOKEN, // Postmark API Token
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // send the actual email
  // you can get emails from this website:- https://10minutesemail.net/
  // the domain should be yourName@uf.edu.pl
  async send(template, subject) {
    //1)render html based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    //2) define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Or just 'noreply@yourdomain.com'
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    //3) create a transport and send email
    await this.newTransport().sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent successfully:', info);
      }
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)!',
    );
  }
};
