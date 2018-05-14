'use strict';

const path = require('path');

const KoaCI = require('..');
const Server = new KoaCI.Server({
    "PORT": 4000,
    'APPPATH': path.join(__dirname, './app/'),
    'ROOTPATH': path.join(__dirname, './'),
});

// 启动
Server.start((CI) => {
    console.log(`${CI.options.PORT}: success!`);
});