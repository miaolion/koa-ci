'use strict';

const path = require('path');
const Emitter = require('events');
const Cache = require('./Cache');

class CI extends Emitter {
  constructor() {
    super();
  }

  loadConfig(configPath) {
    if (Cache._configCache[configPath]) {
      return Cache._configCache[configPath];
    }

    let APPPATH = global.APPPATH;
    let filePath = path.join(APPPATH, '/config/', configPath);
    let config;
    try {
      config = require(filePath);
    } catch (err) {
      throw new Error(err);
    }

    // cache
    Cache._configCache[configPath] = config;

    return config;
  }

  loadController(controllerPath) {
    if (Cache._controllerCache[controllerPath]) {
      return Cache._controllerCache[controllerPath];
    }
    try {
      let APPPATH = global.APPPATH;
      let filePath = path.join(APPPATH, '/controllers/', controllerPath);
      let controller = require(filePath);
      let instance = new controller();

      //cache
      Cache._controllerCache[controllerPath] = instance;

      return instance;
    } catch (err) {
      throw new Error(err);
    }
  }

  loadModel(modelPath) {
    if (Cache._modelCache[modelPath]) {
      return Cache._modelCache[modelPath];
    }
    try {
      let APPPATH = global.APPPATH;
      let filePath = path.join(APPPATH, '/models/', modelPath);
      let model = require(filePath);
      let instance = new model();

      //cache
      Cache._modelCache[modelPath] = instance;

      return instance;
    } catch (err) {
      throw new Error(err);
    }
  }

  loadMiddleware(middleware) {
    if (Cache._middlewareCache[middleware]) {
      return Cache._middlewareCache[middleware];
    }

    // 先从node_modules找
    // 再从app下middlewares找
    let mw = '';
    try {
      mw = require(middleware);
    } catch (err) {
      if (err.message.indexOf('Cannot find module') > -1) {
        try {
          mw = require(path.join(global.APPPATH, `middlewares/${middleware}`));
        } catch (err) {
          throw new Error(err);
        }
      } else {
        throw new Error(err);
      }
    }

    // cache
    Cache._middlewareCache[middleware] = mw;

    return mw;
  }
}

module.exports = CI;