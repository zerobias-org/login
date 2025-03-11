const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const markdown = require('marked');
const i18n = require('i18n');
const path = require('path');
const hbs = require('hbs');
const { getLogger } = require('@auditmation/util-logger');

const logger = getLogger('console');

const basePath = `${process.env.LOGIN_BASE_PATH || ''}/:domain`;
// Comment previous line and uncomment next line for local dev
// const basePath = '';

logger.info('Configuring with base path %s', basePath);

// configure i18n
i18n.configure({
  locales: ['en_US'],
  defaultLocale: 'en_US',
  cookie: 'dana-locale',
  directory: path.join(__dirname, 'assets/translations'),
  objectNotation: true,
  logDebugFn: function (msg) {
    logger.debug(msg);
  },
  logWarnFn: function (msg) {
    logger.warn(msg);
  },
  logErrorFn: function (msg) {
    logger.error(msg);
  },
});

// configure HBS handlebars
const sdkPath = 'node_modules/@auditmation/dana-login-sdk/assets/';
hbs.registerPartials(sdkPath + '/partials/', function (err) {
  if (err) {
    logger.error('Could not register SDK partials', err);
  } else {
    logger.info('SDK partials registered');
    hbs.registerPartials(`${__dirname}/partials/`, function (err) {
      if (err) {
        logger.error('Could not register partials', err);
      } else {
        logger.info('Local partials registered');
      }
    });
  }
});

hbs.registerHelper('__', function () {
  return i18n.__.apply(this, arguments);
});
hbs.registerHelper('__n', function () {
  return i18n.__n.apply(this, arguments);
});

// configure Express
const router = express.Router();
const app = express();
app.use(cookieParser());
app.use(i18n.init);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'hbs');
app.engine('hbs', hbs.__express);

// Request logging
router.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} ${JSON.stringify(req.ips)}`);
  next();
});

// serve up assets
router.use(
  `${basePath}/favicon.png`,
  express.static(`${__dirname}/assets/images/favicon.png`));
router.use(
  `${basePath}/assets/lib`,
  express.static(`${__dirname}/node_modules/`,
    {
      setHeaders: function (res, path, stat) {
        if (path.endsWith('ts') || path.endsWith('cjs')) {
          res.set('content-type', 'application/javascript');
        }
      }
    })
);

console.log('BASE PATH', basePath);

router.use(
  `${basePath}/assets`, 
  express.static(`${__dirname}/assets/`));
router.use(
  `${basePath}/assets`, 
  express.static(`${__dirname}/node_modules/@auditmation/dana-login-sdk/assets/`));

router.use((req, res, next) => {
  const b64 = req.headers['dana-login-context'];
  let loginContext = {};
  if (b64) {
    let buff = Buffer.from(b64, 'base64');
    loginContext = JSON.parse(buff.toString('utf8'));
  } 
  req.loginContext = loginContext;
  next();
});

/**
 * EULA structure:
 *   - eulas
 *       - 944b0637-7e75-4568-9991-b0297314e5ad/
 *           - meta.json
 *           - en_US.md
 *           - de_DE.md
 *           ...
 * 
 * meta.json contains:
 *     - subtitle
 *     - version
 *
 */
router.get(`${basePath}/eulas/:id`, function (req, res, next) {
  const id = req.params.id;
  const dir = `${__dirname}/eulas/${id}`;
  if (!fs.existsSync(dir)) {
    // TODO
    res.send(404);
  }
  const meta = JSON.parse(fs.readFileSync(`${dir}/meta.json`, {encoding: 'utf-8'}));
  const context = {
    eula: meta,
    ...req.loginContext
  }
  const md = fs.readFileSync(`${dir}/${req.locale}.md`, {encoding: 'utf-8'});
  context.eula.content = hbs.handlebars.compile(markdown(md));
  res.render('eula', context);
});

router.get(`${basePath}/:module?`, function (req, res, next) {
  const module = req.params.module || 'login';
  logger.info(`rendering ${module}@${req.locale} for ${req.params.domain}`);
  res.render(module, req.loginContext);
});

app.use('/', router);

app.listen(3001);
