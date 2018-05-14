'use strict';

/**
 * Module dependencies.
 */
const debug = require('debug')('demo:server');
const http = require('http');
const path = require('path');

// CI
const CI = require('./CI');
// app
const App = require('./App');
// route
const Route = require('./Route');

class Server extends CI {
    constructor(options, method) {
        super();

        this.options = {
            // CI
            'ENV': 'development',
            'APPPATH': path.join(__dirname, '../../app/'),
            'SYSTEMPATH': path.join(__dirname, '../../system/'),
            'ROOTPATH': path.join(__dirname, '../../'),
            'PORT': '3000',

            // APP
            'appConifg': {
                'staticPath': path.join(__dirname, '../../static/'),
                'viewPath': path.join(__dirname, '../../app/view/')
            },

            // ROUTE
            'routeConifg': {
                'prefix': '/node',
                'customPrefix': '/node_custom'
            },

            // middlewares
            'customMiddleware': {
                'middlewares': []
            }
        };
        this.method = {
            'onListening': () => {
                this.onListening();
            },
            'onError': (err) => {
                this.onError(err);
            },
            'appMethod': {},
            'routeMethod': {}
        };

        this.app = null;
        this.router = null;
        this.server = null;

        this.options = Object.assign(this.options, options);
        this.method = Object.assign(this.method, method);
        this.globalVar();
    }

    globalVar() {
        global.ENV = this.options.ENV;
        global.APPPATH = this.options.APPPATH;
        global.SYSTEMPATH = this.options.SYSTEMPATH;
        global.ROOTPATH = this.options.ROOTPATH;
        global.PORT = this.options.PORT;
    }

    start(call) {
        if (this.server) {
            return this.server;
        }

        // app
        this.app = new App(this.options.appConifg, this.method.appMethod);
        let app = this.app.create();

        // middlewaresCustom
        let customMiddleware = this.options.customMiddleware;
        let middlewares = customMiddleware.middlewares;
        middlewares && middlewares.map((middleware) => {
            let options = customMiddleware[middleware] || {};
            middleware = this.loadMiddleware(middleware);
            app.use(middleware(options));
        });

        // route
        this.router = new Route(this.options.routeConifg, this.method.routeMethod);
        let router = this.router.create();

        // customRouter
        let customRouter = this.router.custom();

        // router-middleware
        app.use(router.routes());
        app.use(customRouter.routes());

        // server
        this.server = http.createServer(app.callback());
        this.server.listen(this.options.PORT);
        this.server.on('error', this.method.onError);
        this.server.on('listening', this.method.onListening);

        call && call(this);
        return this.server;
    }

    onListening() {
        let addr = this.server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }

    onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = 'Port ' + this.options.PORT;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

module.exports = Server;