'use strict';

const path = require('path');
const compose = require('koa-compose');
const CI = require('./CI');

class Controller extends CI {
    constructor(ctx, options) {
        super();

        this.ctx = ctx;
        this.options = Object.assign({
            'appdoc': '',
            'preMiddleware': {
                'middlewares': []
            },
            'afterMiddleware': {
                'middlewares': []
            }
        }, options);

        //业务存储信息传递
        this.ctx._info = {};

        //拷贝一份入参, 用于 get_post 方法
        this._query = Object.assign({}, ctx && ctx.query);
        this._body = Object.assign({}, ctx && ctx.request.body);

        //执行的方法
        this._action = '';
    }

    async _init() {
        try {
            let p = Promise.resolve(0);

            // preMiddlewares
            p = p.then(() => {
                return this._preMiddleware();
            });

            // preAction
            if (typeof(this['preAction']) === 'function') {
                let retPre = this.preAction();
                if (!(retPre instanceof Promise)) {
                    retPre = Promise.resolve(retPre);
                }
                p = p.then(() => {
                    return retPre;
                })
            }

            // execAction
            p = p.then(data => {
                let infos = [this.ctx];
                if (data !== undefined) {
                    if (Array.isArray(data)) {
                        infos = infos.concat(data);
                    } else {
                        infos.push(data);
                    }
                }
                let action = this[this._action].apply(this, infos);
                if (!(action instanceof Promise)) {
                    action = Promise.resolve(action);
                }
                return action;
            });

            // afterAction
            p = p.then(data => {
                let retAfter = Promise.resolve(data);
                //交给业务方去做收尾工作, 比如说对输出格式的统一加工
                if (typeof(this['afterAction']) === 'function') {
                    retAfter = this.afterAction(data);
                    if (!(retAfter instanceof Promise)) {
                        retAfter = Promise.resolve(retAfter)
                    }
                }

                // afterMiddlewares
                return this._afterMiddleware().then(() => {
                    return retAfter;
                });
            });

            // error-handlers
            p = p.catch(err => {
                return this.rejectAction(err);
            });

            return p;
        } catch (err) {
            return this.rejectAction(err);
        }
    }

    _preMiddleware() {
        return this._dispatch(this.options.preMiddleware);
    }

    _afterMiddleware(next) {
        return this._dispatch(this.options.afterMiddleware, next);
    }

    _dispatch(middlewaresMap, next) {
        let fnMiddleware = [];
        let middlewares = middlewaresMap.middlewares;
        middlewares && middlewares.map((middleware) => {
            let options = middlewaresMap[middleware] || {};
            middleware = this.loadMiddleware(middleware);
            fnMiddleware.push(middleware(options));
        });
        if (!fnMiddleware.length) {
            return Promise.resolve();
        } else {
            return compose(fnMiddleware)(this.ctx, next);
        }
    }

    preAction() {
        // todo
        return Promise.resolve();
    }

    afterAction(data) {
        // todo
        data = data || '';
        return Promise.resolve(data);
    }

    rejectAction(err) {
        // todo
        return err;
    }

    get_post(key, method) {
        let valuePost = this._body[key];
        if (valuePost === undefined && this._body) {
            valuePost = this._body[key];
        }

        let valueGet = this._query[key];
        if (valueGet === undefined) {
            valueGet = this._query[key];
        }

        let value;

        if (/get/i.test(method)) {
            value = valueGet;
        } else if (/post/i.test(method)) {
            value = valuePost;
        } else if (valuePost === undefined) {
            value = valueGet;
        } else {
            value = valuePost
        }

        return value === undefined ? '' : value;
    }

    log(msg) {
        this.ctx._info.logs = this.ctx._info.logs || [];
        this.ctx._info.logs.push(msg);
    }
}

module.exports = Controller;