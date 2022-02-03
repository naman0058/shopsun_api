var mysql = require('mysql')
require('dotenv').config()


const pool = mysql.createPool({
  
  host : 'db-mysql-blr1-84599-do-user-10517489-0.b.db.ondigitalocean.com',
  user: 'doadmin',
  password : '92jtzWjQTRx8Cn6w',
  database: 'dummy',
  port: '25060' ,
  multipleStatements: true
  })



 
module.exports = pool;
