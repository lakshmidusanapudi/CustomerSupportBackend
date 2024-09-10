require('dotenv').config();
const mysql2 = require('mysql2');

const connection = mysql2.createPool({
    host: process.env.DB_URL,       
    port: process.env.DB_PORT,       
    user: process.env.DB_USERNAME,   
    password: process.env.DB_PASSWORD, 
    database: process.env.DBNAME    
}).promise();

module.exports = connection;