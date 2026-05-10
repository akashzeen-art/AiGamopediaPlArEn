const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = __dirname;

function sendHtml(file) {
  return (req, res) => res.sendFile(path.join(root, file));
}

function localeRouter() {
  const r = express.Router();
  r.get('/', sendHtml('index.html'));
  r.get('/index.html', sendHtml('index.html'));
  r.get('/moreGames.html', sendHtml('moreGames.html'));
  r.get('/myAccount.html', sendHtml('myAccount.html'));
  r.get('/termsAndConditions.html', sendHtml('termsAndConditions.html'));
  r.use(express.static(root));
  return r;
}

for (const lang of ['ar', 'pl']) {
  app.get(BASE_PATH + '/' + lang, sendHtml('index.html'));
  app.get(BASE_PATH + '/' + lang + '/', sendHtml('index.html'));
  app.use(BASE_PATH + '/' + lang, localeRouter());
}

// Root static files
app.use(BASE_PATH + '/', express.static(root));
// Root HTML
app.get(BASE_PATH + '/', sendHtml('index.html'));
if (BASE_PATH) {
  app.get(BASE_PATH, sendHtml('index.html')); // /portal without trailing slash
}

app.listen(PORT, '0.0.0.0', () => {
  const host = `http://localhost:${PORT}`;
  const base = host + BASE_PATH;
  console.log(`Poker 365 running on port ${PORT}`);
  console.log(`  English: ${base}/`);
  console.log(`  Arabic:  ${base}/ar`);
  console.log(`  Polish:  ${base}/pl`);
  if (BASE_PATH) console.log(`  (BASE_PATH=${BASE_PATH})`);
});
