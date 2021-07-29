const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');
const path = require('path');
const db = require('./utils/db');
const config = require('./config.js');
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('./tls_keys/eventmarketclub.key'),
  cert: fs.readFileSync('./tls_keys/eventmarketclub.cer'),
};

// ########################################
// ########################################

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: false}));

app.use('/api/oas-spec', express.static(`${__dirname}/api/openapi.yaml`));
app.use('/api/oas-ui', swaggerUi.serve, swaggerUi.setup(YAML.load(`${__dirname}/api/openapi.yaml`)));

app.use(
    OpenApiValidator.middleware({
      apiSpec: `${__dirname}/api/openapi.yaml`,
      validateResponses: true,
    }));

app.get('/oauth2-redirect.html', (request, response) => {
  response.redirect('/api/oas-ui/oauth2-redirect.html');
});

// frontend
app.use(express.static('../frontend/build'));

app.get('*', function(req, res, next) {
  if (!req.url.includes('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  } else {
    next();
  }
});

// endpoints
require('./routes/index.js')(app);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

// ########################################
// ########################################
//
module.exports = new Promise(async (resolve, reject) => {
  await db.setup();

  if (process.env.NODE_ENV == 'PRODUCTION') {
    https.createServer(options, app).listen(config.PORT, () => {
      console.log(`UI: https://localhost`);
      console.log(`API: https://localhost/api`);
      console.log(`OAS UI: https://localhost/api/oas-ui/`);
      console.log(`OAS SPEC: https://localhost/api/oas-spec/`);
      resolve(app);
    });
  } else {
    app.listen(config.PORT, () => {
      console.log(`UI: http://localhost:${config.PORT}`);
      console.log(`API: http://localhost:${config.PORT}/api`);
      console.log(`OAS UI: http://localhost:${config.PORT}/api/oas-ui/`);
      console.log(`OAS SPEC: http://localhost:${config.PORT}/api/oas-spec/`);
      resolve(app);
    });
  }
});
