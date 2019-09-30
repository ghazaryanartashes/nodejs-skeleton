import MongooseError from 'mongoose/lib/error';
import winston from 'winston';
import expressWinston from 'express-winston';

import BaseApiError from 'exceptions/BaseApiError';
import UnauthorizedError from 'exceptions/UnauthorizedError';
import ValidationError from 'exceptions/ValidationError';
import NotFoundError from 'exceptions/NotFoundError';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => {
      const { error } = info.meta;
      return `${info.timestamp} ${error.name}: ${error.message} \n${
        info.meta.stack
      }`;
    })
  ),
  transports: [new winston.transports.Console()]
});

module.exports = function(app) {
  app.route('/*').all((req, res, next) => {
    next(new NotFoundError('Resource not found.'));
  });

  app.use(
    expressWinston.errorLogger({
      winstonInstance: logger
    })
  );

  /**
   * Default error handler
   *
   * Requires the full set of arguments to distinct from a regular middleware
   *
   * @param  {Error|Object}   err  Error that is passed via next functions
   * @param  {Request}        req  Request object
   * @param  {ServerResponse} res  Server response crafted in the endpoint
   * @param  {Function}       next Continues the express middleware stack
   */
  /* eslint-disable no-unused-vars */
  app.use((error, req, res, next) => {
    let err = error;
    if (err.name === 'ValidationError') {
      let message = err.message || err;
      if (err.details) {
        /* eslint-disable prefer-destructuring */
        message = err.details[0].message || message;
      }
      err = new ValidationError(message, err.details);
    }
    if (err.name === 'NotFoundError') {
      err = new NotFoundError(err.message, err.details);
    }
    if (err.name === 'UnauthorizedError') {
      err = new UnauthorizedError(
        err.message || 'Authentication token is either invalid or expired.',
        err.message
      );
    }
    if (err instanceof MongooseError.ValidationError) {
      err = ValidationError.fromMongoose(err);
    }
    if (err instanceof BaseApiError) {
      res.status(err.status).json({
        success: false,
        message: err.message,
        data: {
          // details: err.details || [],
        }
      });
    } else {
      res
        .status(err.status || 500)
        .json({
          success: false,
          message: err.message || 'Something went wrong',
          data: {
            // details: err.details || [],
          }
        })
        .end();
    }
  });
};
