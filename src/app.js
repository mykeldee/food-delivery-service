'use strict';
require('dotenv').config();

const express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  path = require('path'),
  passport = require('passport'),
  { MongoClient, ServerApiVersion } = require('mongodb'),
  mongoose = require('mongoose'),
  logger = require('morgan');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const uri = process.env.MONGOCONNECTIONURI;
const port = process.env.PORT;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   console.log('error is===>',err)
//   client.close();
// });

mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true})
  .then(result => {
    app.listen(port)
    console.log('listening')
  })
  .catch(err => console.log('eeerrrroorrr is',err))



app.use(logger('dev'));
app.use(session({ secret: 'SECRET', resave: true, saveUninitialized: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

require('./routes')(app); // Set Application routes and their handlers

if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(require('errorhandler')());
}

module.exports = app;
