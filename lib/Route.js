'use strict';

const path = require('path');
const fs = require('fs');
const router = require('koa-router');

class Router {
    constructor(options, method) {
        this.options = Object.assign({
            'prefix': '',
            'customPrefix': ''
        }, options);
        this.method = Object.assign({}, method);

        this.router = null;
        this.customRouter = null;
    }

    create() {
        // create
        this.router = router();

        // 加前缀
        this.router.prefix(this.options.prefix);

        // d,c,m映射完整的路径
        this.router.all('/:d/:c/:m', async (ctx, next) => {
            let {d, c, m} = ctx.params;
            // d,c,m映射油路
            const controller = require(path.join(global.APPPATH, 'controllers/', `${d}/${c}`));
            // 执行业务
            return this.invokeAction(controller, m, ctx, next);
        });

        // c,m映射油路没有d路径
        this.router.all('/:c/:m', async (ctx, next) => {
            let {c, m} = ctx.params;
            // d,c映射油路没有d路径
            const controller = require(path.join(global.APPPATH, 'controllers/', `${c}`));
            // 执行业务
            return this.invokeAction(controller, m, ctx, next);
        });

        return this.router;
    }

    custom() {
        // create
        this.customRouter = router();

        // 加前缀
        this.customRouter.prefix(this.options.customPrefix);

        // 加载route文件夹下所有文件
        if (fs.existsSync(global.APPPATH + 'routes')) {
            let fileList = fs.readdirSync(global.APPPATH + 'routes');
            fileList.forEach((file) => {
                if (/\.js$/.test(file)) {
                    try {
                        let _subRouter = require(path.join(global.APPPATH + 'routes', file));
                        this.customRouter.use(_subRouter.routes(), _subRouter.allowedMethods());
                    } catch (err) {
                        throw new Error(err);
                    }
                }
            });
        }

        return this.customRouter;
    }

    async invokeAction(controller, m, ctx, next) {
        const instance = new controller(ctx);
        instance._action = m;

        // 进入业务路径执行
        let data = await instance._init();
        ctx.body = data;

        // 结束业务执行
        return next();
    }
}

module.exports = Router;
