var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var swaggerJSDoc = require('swagger-jsdoc');
var compression = require('compression');
var app = express();

// swagger definition
var swaggerDefinition = {
  info: {
    title: 'DiemDanh API',
    version: '1.0.0',
    description: 'Demonstrating how to use DiemDanh API with your application',
  },
  host: 'https://tpltesting.herokuapp.com',
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./api/swagger.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors()); //normal CORS
app.use(express.static(path.join(__dirname, 'swagger')));
app.use(compression());

app.get('/api/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/authenticate', require('./api/authenticate'));
app.use('/seed', require('./api/seed'));
app.use('/api', require('./api/api'));

 const forceSSL = function() {
   return function (req, res, next) {
     if (req.headers['x-forwarded-proto'] !== 'https') {
       return res.redirect(
      ['https://', req.get('Host'), req.url].join('')
      );
     }
     next();
   }
 }

 app.use(forceSSL());


//Xác định trang "public" cho client
app.use(express.static(path.join(__dirname, 'dist')));

app.use('*', function(req, res, next) {
   res.sendFile(path.join(__dirname,'/dist/index.html'));
});

module.exports = app;
