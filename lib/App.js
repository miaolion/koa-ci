'use strict';

const path = require('path');
const Koa = require('koa');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');

class App {
    constructor(options, method) {
        this.options = Object.assign({
            'enableTypes': ['json', 'form', 'text'],
            'staticPath': '',
            'viewPath': '',
            'viewType': 'nunjucks',
            'customMiddleware': {}
        }, options);
        this.method = Object.assign({}, method);

        this.app = null;
    }

    create() {
        // master
        this.app = new Koa();

        // error handler
        onerror(this.app);

        // error-handling
        this.app.on('error', this.method.error || ((err, ctx) => {
            console.error('server error', err)
        }));

        // middlewares - default
        this.middlewaresDefault();

        return this.app;
    }

    middlewaresDefault() {
        // 测时间
        this.app.use(async (ctx, next) => {
            const start = new Date();
            await next();
            const ms = new Date() - start;
            console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
        });

        // logger
        this.app.use(logger());

        // 头部解析
        this.app.use(bodyparser({
            enableTypes: this.options.enableTypes
        }));

        // json
        this.app.use(json());

        // static
        this.options.staticPath && this.app.use(require('koa-static')(this.options.staticPath));

        // view
        this.options.viewPath && this.app.use(views(this.options.viewPath, {
            extension: this.options.viewType
        }));
    }
}

module.exports = App;
