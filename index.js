const enmapi = require('enmapi');

enmapi.server.setConfig({
  Level: process.env.NODE_ENV || 'development',
  Name: process.env.NAME || 'server component repo',
  Host: process.env.HOST || 'http://localhost',
  Port: process.env.PORT || 3333,
  DatabaseName: process.env.DBNAME || 'server DB',
  DatabaseURI:
    process.env.DB_URI ||
    'mongodb://hxRIGtgQ2qWBZxQbigmcsg0fyDf6pese:EGhWm48B8tMQuMu0e7RfN3nnwnV57LpW@ds012578.mlab.com:12578/unified-market-place'
});

enmapi.server.start();
