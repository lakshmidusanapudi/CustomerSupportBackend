require('dotenv').config()
const mysql=require('mysql2/promise')
const connection=mysql.createPool({
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DBNAME,
    
});
module.exports=connection;