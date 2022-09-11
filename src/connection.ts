import mysql from 'mysql';
import dotenv from 'dotenv';
let host: string, user: string, password: string, database: string;

dotenv.config();

if(process.env.HOST){
    host = process.env.HOST;
}
else{
    throw new Error("HOST environment variable is not set");
}


if(process.env.USER){
    user = process.env.USER;
}
else{
    throw new Error("USER environment variable is not set");
}


if(process.env.PASSWORD){
    password = process.env.PASSWORD;
}
else{
    throw new Error("PASSWORD environment variable is not set");
}


if(process.env.DATABASE){
    database = process.env.DATABASE;
}
else{
    throw new Error("DATABASE environment variable is not set");
}

export const db = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});

//module.exports = db;