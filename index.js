const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const crypto = require('crypto');
const DB_PATH = path.join(__dirname, 'users.db');
const DKLEN = 32;
const cookieParser = require('cookie-parser');  
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));   
app.use(express.json());

app.get('/', (req,res)=>{
    if (req.cookies.username){
        res.sendFile(path.join(__dirname,'views', 'index.html'));
    }
    else{
        res.redirect('/login');
    }
});

app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname,'views', 'login.html'));
});

app.post('/login', (req,res)=>{
    console.log(req.body);
    db.get('Select * from users where email = ?', [req.body.username], (err, row) => {
        console.log(row);
        console.log(crypto.pbkdf2Sync(req.body.password, row.salt, row.iterations, DKLEN, 'sha256').toString('hex'));
        if (req.body.username = row.email && row.password_hash == crypto.pbkdf2Sync(req.body.password, Buffer.from(row.salt, 'hex'), row.iterations, DKLEN, 'sha256').toString('hex') ){ 
            res.cookie('username', req.body.username);
            res.redirect('/');

        }
        else{
            res.send('Invalid username or password');
        }
    });
    // res.send('Login data received');
});
app.get('/logout', (req,res)=>{
    res.clearCookie('username');
    res.redirect('/');
});

app.listen(port,()=>{
    console.log(`server is running of port ${port}`)
})