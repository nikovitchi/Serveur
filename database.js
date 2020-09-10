const Pool = require('pg').Pool;

const pool = new Pool({
    user:"postgres",
    password : "123456",
    database : "NodeJsDB",
    host: "localhost",
    port:5432
});

module.exports = pool; 


// const express = require("express");
// const connectionString = 'postgressql://postgres:123456@localhost:5432/NodeJsDB'

// const app = express();

// console.log('ok');

// const client = new Client({
//     connectionString:connectionString
// })

// client.connect()

// // client.query('SELECT * from "NodeJsSc"."Users"',(err, res) => {
// //     console.table(res.rows);
// //     client.end()
// // })

// app.post('/',)

