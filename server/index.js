import express from 'express';
import { google } from 'googleapis';
import redis from 'redis';
import { promisify } from 'util';

const db = redis.createClient({ host: 'redis.local.ejmorgan.com' });
const hmset = promisify(db.hmset).bind(db);
const exists = promisify(db.exists).bind(db);

const oauth2Client = new google.auth.OAuth2(
  'CLIENT_ID',
  'SECRET',
  'REDIRECT_URI'
);

const app = express();

app.use(express.json());

app.get('/oauth', function(req, res) {
  const { id } = req.query;

  const url = oauth2Client.generateAuthUrl({
    state: id,
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ]
  });

  res.json({ url });
})

app.get('/oauth/callback', async function(req, res) {
  const id = req.query.state;
  const { tokens } = await oauth2Client.getToken(req.query.code);
  const { access_token, scope, token_type, id_token, } = tokens;

  const _oauth = new google.auth.OAuth2();

  _oauth.setCredentials({ access_token, scope, id_token, token_type });
  
  const oauth = google.oauth2({
    auth: _oauth,
    version: 'v2',
  });

  const user = await oauth.userinfo.get();

  await hmset(id, user.data);

  res.send(`<script>window.close();</script>`);
})

app.get('/oauth/:id', async function(req, res) {
  if (await exists(req.params.id)) {
   res.status(200).json({ ok: 1 });
  } else {
    res.status(400).json({ ok: 0 });
  }
})

app.listen(9005, function() {
  console.log('server started');
})