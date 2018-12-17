## Rhizomik Attester

Generate attestations for uPort self-sovereign identities.

Available attestations:

  - E-Mail: through verification e-mail
  
Future work, attestations for social network memberships:

  - YouTube
  - Twitter
  - Facebook


### Install

```bash
npm install
```

### Configure

Edit the `.env` file or through the corresponding environment variables.
```bash
//-----------------------------------------------------------------------
// uPort Application generating attestations, https://developer.uport.me/
//-----------------------------------------------------------------------

appName    = uPort App
network    = rinkeby
signingKey = GENERATED-PRIVATE-KEY

//-----------------------------------------------------------------------
// E-Mail Config
//-----------------------------------------------------------------------

subject    = Email Verification
from       = Rhizomik Attester <attester@rhizomik.net>
user       = user
password   = pass

// GMail
service    = gmail

// Alternative configuration using SMTP
// host      = smtp.email.net
// port      = 465
// secure    = false

//-----------------------------------------------------------------------
```

### Run

```bash
npm start
```

Then, browse the URL where the application is available, for instance `https://attester.rhizomik.net`

The application cannot work if it is not accessible from uPort servers through the Web. For instance, if you start it in your laptop and it is just available from `http://localhost:3000`

In that case, you will need a service like *ngrok* as detailed in the next section.

### Run Locally

```bash
npm start &
npm run ngrok
```

Then, browse the URL provided by ngrok, somethin like `https://5d251795.ngrok.io`