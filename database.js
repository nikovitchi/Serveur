const Pool = require('pg').Pool;
var serv = require('express')();
const express = require('express')
const pool = new Pool({
    user:"postgres",
    password : "123456",
    database : "NodeJsDB",
    host: "localhost",
    port:5432
});




serv.use(express.json());
serv.listen(5000, ()=>{
    console.log('database connected on *: 5000');
})

//Routes

serv.post('/users', async(req, res)=>{
    try {
        const { Name,Color,LogTime } = req.body;
        const newUser = await pool.query('INSERT INTO "NodeJsSc"."UsersList" ("Name","Color","LogTime") VALUES ($1,$2,$3) RETURNING*',
         [Name,Color,LogTime]
         );

        res.json(newUser);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})

serv.get('/users', async(req, res)=>{
    try {
        const allUsers = await pool.query('SELECT * FROM "NodeJsSc"."UsersList"');
        res.json(allUsers.rows);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})


module.exports = pool; 