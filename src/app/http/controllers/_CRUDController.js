import BaseController from 'controllers/_BaseController';
import NotImplementedError from 'exceptions/NotImplementedError';
import express from 'express';
import { filterPaths, preparePopulate } from 'lib/utils';
import existingModel from 'middleware/ExistingModel';
import mongoose from 'mongoose';
import pluralize from 'pluralize';
import { specifyLanguage } from '../../../lib/utils';

pluralize.addPluralRule(/code$/i, 'code');

export default class CRUDController extends BaseController {
  constructor() {
    super();
    this._validators = {};
    this._validators.create = (req, res, next) => next();
    this._validators.update = (req, res, next) => next();
    this._validators.destroy = (req, res, next) => next();
    this._validators.show = (req, res, next) => next();
    this._middleware = [
      (req, res, next) => {
        next();
      }
    ];
    this._multilanguage = [];
  }

  registerRoutes(app) {
    const router = express.Router();
    router.get('/', this.index.bind(this));
    router.post(
      '/',
      ...this._middleware,
      this._validators.create,
      this.create.bind(this)
    );
    router.get(
      '/:id',
      this._validators.show,
      existingModel(this._modelName),
      this.show.bind(this)
    );
    router.put(
      '/:id',
      ...this._middleware,
      this._validators.update,
      existingModel(this._modelName),
      this.update.bind(this)
    );
    router.delete(
      '/:id',
      this._validators.destroy,
      existingModel(this._modelName),
      this.destroy.bind(this)
    );

    app.use(this._path, router);
  }

  index(req, res, next) {
    if (!this._query) {
      return next(new NotImplementedError('Method not yet implemented!'));
    }
    req.query.populate = filterPaths(
      req.query.populate,
      mongoose.model(this._modelName)
    );
    this._query(req.query, req)
      .then(result => {
        const modelsField = pluralize(
          this._modelName.replace(
            this._modelName[0],
            this._modelName[0].toLowerCase()
          )
        );

        if (req.user.role !== 'admin') {
          result[modelsField] = (result[modelsField] || []).map(model => {
            return specifyLanguage(
              this._multilanguage,
              model.toJSON(),
              req.lng || ['EN']
            );
          });
        }
        res.json(this._createResponse(result));
      })
      .catch(next);
  }

  show(req, res, next) {
    if (!this._getModel) {
      return next(new NotImplementedError('Method not yet implemented!'));
    }
    const paths = filterPaths(
      req.query.populate,
      mongoose.model(this._modelName)
    );
    this._getModel(req.params.id, req)
      .populate(preparePopulate(paths))
      .then(model => {
        if (req.user.role !== 'admin') {
          model = specifyLanguage(
            this._multilanguage,
            model.toJSON(),
            req.lng || ['EN']
          );
        }
        const data = {};
        data[this._modelName.toLowerCase()] = model;
        res.json(this._createResponse(data));
      })
      .catch(next);
  }

  create(req, res, next) {
    if (!this._createModel) {
      return next(new NotImplementedError('Method not yet implemented!'));
    }
    this._createModel(req.body, req.user, req)
      .then(model => {
        const data = {};
        data[this._modelName.toLowerCase()] = model;
        res.json(this._createResponse(data)).status(201);
      })
      .catch(next);
  }

  update(req, res, next) {
    if (!this._updateModel) {
      return next(new NotImplementedError('Method not yet implemented!'));
    }
    this._updateModel(req.params.id, req.body, req)
      .then(model => {
        const data = {};
        data[this._modelName.toLowerCase()] = model;
        res.json(this._createResponse(data));
      })
      .catch(next);
  }

  destroy(req, res, next) {
    if (!this._deleteModel) {
      return next(new NotImplementedError('Method not yet implemented!'));
    }
    this._deleteModel(req.params.id, req)
      .then(() => {
        res.json(this._createResponse()).status(204);
      })
      .catch(next);
  }
}
