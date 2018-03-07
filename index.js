const enmapi = require('enmapi');

enmapi.server.setConfig({
  Level: process.env.NODE_ENV,
  Name: process.env.NAME,
  Host: process.env.HOST,
  Port: process.env.PORT,
  DatabaseName: process.env.DBNAME,
  DatabaseURI: process.env.DB_URI
});

enmapi.server.start();
