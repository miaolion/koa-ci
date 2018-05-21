## Installation

Koa-ci requires __node v7.6.0__ or higher for ES2015 and async function support.

```
$ npm install koa-ci
```

## Koa-ci

```js
'use strict';

const KoaCI = require('koa-ci');
const Server = new KoaCI.Server({
    // config
    'PORT': 6789,
    'APPPATH': path.join(__dirname, './app/'),
    'ROOTPATH': path.join(__dirname, './'),
    'customMiddleware': {
        'PORT': 3000,
        'middlewares': ['test'],
        'test': {
            'name': 'customMiddleware'
        }
    }
});

// 启动
Server.start((CI) => {
    console.log(`${CI.options.PORT}: success!`);
});
```