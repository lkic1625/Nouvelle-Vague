require('dotenv').config();

module.exports = {
    "development": {
      "username": "root",
      "password": process.env.SEQUELIZE_PASSWORD,
      "database": "database_NV",
      "host": "127.0.0.1",
      "dialect": "mysql"
      
    },
    "test": {
      "username": "root",
      "password": process.env.SEQUELIZE_PASSWORD,
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "username": "root",
      "password": process.env.SEQUELIZE_PASSWORD,
      "database": "database_bookmark",
      "host": "127.0.0.1",
      "dialect": "mysql"
    }
  };
  
