import express from 'express';
import StartupController from 'controllers/StartupController';

module.exports = app => {
  const router = express.Router();
  StartupController.registerRoutes(router);

  app.use('/v1', router);
  return router;
};
