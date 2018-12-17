import { Credentials } from 'uport-credentials';
import * as jwtDecode from 'jwt-decode';
import * as url from 'url';
import * as qrImage from 'qr-image';
import * as Isemail from 'isemail';
import EmailSender from './emailer';
import { log } from 'util';

const decodeJWT = require('did-jwt').decodeJWT;
const message = require('uport-transports').message.util;
const transports = require('uport-transports').transport;

require('dotenv').config();

const Time365Days = () => Math.floor(new Date().getTime() / 1000) + 365 * 24 * 60 * 60;

class UPortHelper {
  private credentials: Credentials;
  private emailer: EmailSender;

  constructor() {
    this.credentials = new Credentials({
      appName: process.env.appName,
      network: process.env.network,
      privateKey: process.env.signingKey,
    });
    this.emailer = new EmailSender({
      auth: { user: process.env.user, pass: process.env.password },
      service: process.env.service,
      host: process.env.host,
      port: process.env.port,
      secure: process.env.secure == "true",
    });
  }

  async getDisclosureQR(callbackUrl) {
    const requestToken = await this.credentials.createDisclosureRequest({
      network: process.env.network, accountType: 'general',
      requested: ['email'], verified: ['attester'],
      notifications: true,
      callbackUrl: callbackUrl
    });
    const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'});
    const qr =  this.createQRPNGDataURI(uri);
    return { uri: uri, qr: qr };
  }

  async getVerifiedEmail(token) {
    const identity = await this.credentials.authenticateDisclosureResponse(token);
    const unverifiedEmail = identity.email;
    let verifiedEmail = undefined;
    if (identity.verified && identity.verified.length == 1 &&
        identity.verified[0].claim.attester &&
        identity.verified[0].claim.attester.email) {
      verifiedEmail = identity.verified[0].claim.attester.email;
    }
    return {unverifiedEmail: unverifiedEmail, verifiedEmail: verifiedEmail}
  }

  async sendVerificationEmail(email, callbackUrl) {
    if (!Isemail.validate(email)) return;
    const { uri, qr } = await this.getDisclosureQR(`${callbackUrl}?email=${email}`);
    return await this.emailer.sendEmail(process.env.from, email, process.env.subject, qr, uri);
  }

  async verifyEmail(token) {
    const requestToken = jwtDecode(token).req;
    const callbackUrlWithEmail = jwtDecode(requestToken).callback;
    const callbackEmail = url.parse(callbackUrlWithEmail, true).query.email;
    const identity = await this.credentials.authenticateDisclosureResponse(token);

    if (callbackEmail !== identity.email) {
      log(`Error: callback email (${callbackEmail}) and uPort identity email (${identity.email}) are not the same`);
      return;
    }
    const push = transports.push.send(identity.pushToken, identity.boxPub);
    this.credentials.createVerification({
      sub: identity.did,
      exp: Time365Days(),
      claim: {'attester': {'email': identity.email}}
    }).then(att => {
      log(`Generated attestation: ${JSON.stringify(decodeJWT(att), null, 1)}`);
      return push(att)
    }).then(res => {
      log('Attestation pushed to the user');
    })
  }

  private createQRPNGDataURI(data) {
    let pngBuffer = qrImage.imageSync(data, { type: 'png', size: 4 });
    return 'data:image/png;base64,' + pngBuffer.toString('base64');
  }
}

export default UPortHelper
