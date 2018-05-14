## Installation

Koa-ci requires __node v7.6.0__ or higher for ES2015 and async function support.

```
$ npm install koa-ci
```

## Hello Koa-ci

```js
'use strict';

const KoaCI = require('./system/');
const Server = new KoaCI.Server({
    // config
    customMiddleware: {
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