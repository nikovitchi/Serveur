const { Pool, Client } = require('pg')
const connectionString = 'postgressql://postgres:123456@localhost:5432/NodeJsDB'

console.log('ok');

const client = new Client({
    connectionString:connectionString
})

client.connect()

client.query('SELECT * from "NodeJsSc"."Users"',(err, res) => {
    console.table(res.rows);
    client.end()
})