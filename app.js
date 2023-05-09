const createError = require('http-errors');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const cors = require("cors")
require('dotenv').config()

const indexRouter = require('./routes/index');
const recordsRouter = require("./routes/records");
const { esp32, commands, updates } = require("./routes/sockets");

console.log('connecting to', process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/records', recordsRouter);

app.ws('/api/esp32', esp32);
app.ws('/api/commands', commands);
app.ws('/api/updates', updates);

app.ws('/echo', function (ws, req) {
  ws.on('message', function (msg) {
    ws.send(msg + " from server");
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

module.exports = app;
