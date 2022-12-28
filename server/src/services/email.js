require("dotenv").config();
const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = "Ahmed Adel <hello@gmail.com>";
  }

  newTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "welcome to our family :)");
  }
  async sendGoodBy() {
    await this.send("delete", "We will miss you, please come back soon!!");
  }

  async sendPasswordreset() {
    await this.send(
      "passwordReset",
      "Your password token (valid for onlu 10 mints)"
    );
  }
}

module.exports = Email;
