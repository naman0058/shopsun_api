


  var mysql = require('mysql')
  require('dotenv').config()
  
  const pool = mysql.createPool({
    host:'103.117.180.114',
    ///host : 'localhost',
     user: 'shopsun_shopsun',
    password:'Shopsun@321!',
      database: 'shopsun_shopsun',
      port:'3306' ,
      multipleStatements: true
    })
  
  
  
  
  module.exports = pool;

