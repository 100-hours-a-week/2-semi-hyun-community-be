const express = require('express');
const sql = require('mysql')

const connection = sql.createConnection({
    host: 'community.c1ewessaiii1.ap-northeast-2.rds.amazonaws.com', //엔드포인트
    user: 'admin', //유저명
    password: 'JhYVujzreSgd', //비밀번호
    database: 'community', //데이터베이스 이름
    port: 3306 //포트번호
})

const app = express();
const port = 3000;




// connection.connect();
// module.exports = connection;