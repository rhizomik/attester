import * as nodemailer from 'nodemailer';
import * as inlineBase64 from 'nodemailer-plugin-inline-base64';

class EmailSender {
  private emailHtmlTemplate = (qr, uri) =>
      `<div style="text-align: center;">
          <img src="${qr}">
          <p style="text-align: center;"><a href="${uri}">Click here if on mobile</a></p>
       </div>`;
  private transporter: any;

  constructor (transportOptions = {
    auth: { user: 'user', pass: 'pass' },
    service: 'gmail',
    host: null,
    port: null,
    secure: false,
  }) {
    this.transporter = nodemailer.createTransport(transportOptions);
    this.transporter.use('compile', inlineBase64({cidPrefix: 'attester_'}));
  }

  sendEmail(from, email, subject, qr, uri) {
    const emailOptions = {
      from: from,
      to: email,
      subject: subject,
      html: this.emailHtmlTemplate(qr, uri),
    };
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(emailOptions, (error, info) => {
        if (error) return reject(error);
        return resolve(info)
      })
    })
  }
}

export default EmailSender