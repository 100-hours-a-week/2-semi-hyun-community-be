const express = require('express');
const sql = require('mysql')

const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'community'
})

const app = express();
const port = 3000;




// connection.connect();
// module.exports = connection;