import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import expressJwt from 'express-jwt';
import cors from 'cors';
import { Joi, errors } from 'celebrate';
import config from 'config';
import MimeLookup from 'mime-lookup';
import { getAnalytics } from 'services/analytics';
import schedule from 'node-schedule';

const j = schedule.scheduleJob('1 */24 * * *', function() {
  getAnalytics();
});

const mime = new MimeLookup(require('mime-db'));

Joi.objectId = require('joi-objectid')(Joi);

const app = express();

require('./db/connect');

app.use(function(req, res, next) {
  res.set = res.header = function header(field, val) {
    const charsetRegExp = /;\s*charset\s*=/;
    if (arguments.length === 2) {
      let value = Array.isArray(val) ? val.map(String) : String(val);

      // add charset to content-type
      if (field.toLowerCase() === 'content-type') {
        if (Array.isArray(value)) {
          throw new TypeError('Content-Type cannot be set to an Array');
        }
        if (!charsetRegExp.test(value)) {
          const charset = mime.charsets.lookup(value.split(';')[0]);
          if (charset) value += '; charset=' + charset.toLowerCase();
        }
      }

      this.setHeader(field, value);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
    return this;
  };
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(
  expressJwt({ secret: config.jwt.key }).unless({
    path: [
      /\/auth\/(.*)/gi,
      /\/devices\/?(.*)/gi,
      /\/orders\/(.*)\/pay/gi,
      /\/orders\/pay\/confirm/gi
    ]
  })
);

app.use(errors());

require('dotenv').config({path: __dirname + '/.env'});
require('./routes')(app);
// require('./config/auth').default(app);
require('./routes/errors')(app);

module.exports = app;
