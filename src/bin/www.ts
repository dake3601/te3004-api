#!/usr/bin/env node

/**
 * Module dependencies.
 */

import { type Port } from '../types';
import app from '../app';
import debug from 'debug';
import http from 'http';

debug('te3004-backend:server');

interface Error {
  syscall?: string
  code?: string
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

app.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val: Port) {
  let port = val;

  if (typeof val === 'string') {
    port = parseInt(val, 10);
  }

  if (typeof port === 'number' && isNaN(port)) {
    // named pipe
    return val;
  }

  if (typeof port === 'number' && port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error: Error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : typeof addr == 'object' && addr !== null && (typeof addr.port === 'number' || typeof addr.port === 'string')
      ? 'port ' + addr.port : '';
  debug('Listening on ' + bind);
}

process.on('SIGINT', function() {
  console.log('Interrupted');
  process.exit();
});
