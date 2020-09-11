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

//Routes Users

//set user
serv.post('/users', async(req, res)=>{
    try {
        const { name,color,logTime,socketID } = req.body;
        const newUser = await pool.query('INSERT INTO "NodeJsSc"."UsersList" ("name","color","logTime","socketID") VALUES ($1,$2,$3,$4) RETURNING*',
         [name,color,logTime,socketID]
         );

        res.json(newUser);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})

//get all users
serv.get('/users', async(req, res)=>{
    try {
        const allUsers = await pool.query('SELECT * FROM "NodeJsSc"."UsersList"');
        res.json(allUsers.rows);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})

//get 1 user
serv.get('/users/:name', async(req, res)=>{
    const { name } = req.params;
    try {
        const user = await pool.query('SELECT * FROM "NodeJsSc"."UsersList" WHERE "name" = $1', [name]);        
        res.json(user.rows[0]);
    } catch (e) {
        console.log(e.message)
    }
})

//update user
serv.get('/users/:name', async(req, res)=>{
    const { name } = req.params;
    try {
        const user = await pool.query('SELECT * FROM "NodeJsSc"."UsersList" WHERE "name" = $1', [name]);        
        res.json(user.rows[0]);
    } catch (e) {
        console.log(e.message)
    }
})


//delet user

//Routes messages

//get all messages
serv.get('/messages', async(req, res)=>{
    try {
        const allMessages = await pool.query('SELECT * FROM "NodeJsSc"."MessagesList"');
        res.json(allMessages.rows);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})

//set message
serv.post('/messages', async(req, res)=>{
    try {
        const { message,senderName,sendTime,color } = req.body;
        const newMessage = await pool.query('INSERT INTO "NodeJsSc"."MessagesList" ("message","senderName","sendTime","color") VALUES ($1,$2,$3,$4) RETURNING*',
         [message,senderName,sendTime,color]
         );

        res.json(newMessage);
        // console.log(req.body);
    } catch (e) {
        console.log(e.message)
    }
})



module.exports = pool; 