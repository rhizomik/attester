import * as express from 'express';
import * as bodyParser from 'body-parser';
import UPortHelper from './uport_helper';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
let endpoint;
let uportHelper;

const htmlTemplate = (uri, qr) =>
    `<div style="text-align: center;">
          <img src="${qr}">
          <p style="text-align: center;"><a href="${uri}">Click here if on mobile</a></p>
     </div>`;

app.use(bodyParser.json({ type: '*/*' }));

app.get('/', async(req, res) => {
  endpoint = (req.headers["x-forwarded-proto"] || req.protocol) + '://' + req.get('host') + req.originalUrl;
  const result = await uportHelper.getDisclosureQR(`${endpoint}callback`);
  res.send(htmlTemplate(result.uri, result.qr))
});

app.post('/callback', async(req, res) => {
  const email = await uportHelper.getVerifiedEmail(req.body.access_token);
  if (email.verifiedEmail) {
    console.info(`E-Mail already attested by Rhizomik Attester: ${email.verifiedEmail}`);
  } else if (email.unverifiedEmail) {
      uportHelper.sendVerificationEmail(email.unverifiedEmail, `${endpoint}email/callback`)
      .then(emailInfo => console.info(emailInfo));
  }
  res.send();
});

app.post('/email/callback', async(req, res) => {
  await uportHelper.verifyEmail(req.body.access_token);
  res.send();
});

app.listen(port, async(err) => {
  if (err) { return console.error(err); }
  uportHelper = new UPortHelper();
  console.info(`Attester listening on port ${port}`)
});
