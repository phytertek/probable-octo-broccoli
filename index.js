const enmapi = require('enmapi');

enmapi.server.setConfig({
  Level: process.env.NODE_ENV,
  Name: process.env.NAME,
  Host: process.env.HOST,
  Port: process.env.PORT,
  DatabaseName: process.env.DBNAME,
  DatabaseURI:
    process.env.DB_URI ||
    'mongodb://hxRIGtgQ2qWBZxQbigmcsg0fyDf6pese:EGhWm48B8tMQuMu0e7RfN3nnwnV57LpW@ds012578.mlab.com:12578/unified-market-place'
});

enmapi.server.start();
