import express, { Request, Response, NextFunction } from 'express';
import expressWs from 'express-ws';
import { handleError } from './utils/handleErrors';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose, { ConnectOptions } from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import indexRouter from './routes/index';
import recordsRouter from './routes/records';
import { esp32, commands, updates } from './routes/sockets';
import type { WebsocketRequestHandler } from 'express-ws';

dotenv.config();

if (typeof process.env.MONGODB_URI === 'undefined') {
  console.log('MONGODB_URI is undefined');
  process.exit(1);
}

console.log('connecting to', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true } as ConnectOptions)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error: Error) => {
    console.log('error connection to MongoDB:', error.message);
  });


const app = expressWs(express()).app;

// Compression
app.use(compression());
// view engine setup
app.set('views', path.join(__dirname, '/../views'));
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

app.ws('/api/esp32', (esp32 as unknown) as WebsocketRequestHandler);
app.ws('/api/commands', (commands as unknown) as WebsocketRequestHandler);
app.ws('/api/updates', (updates as unknown) as WebsocketRequestHandler);

app.ws('/api/echo', (ws, _req: Request) => {
  ws.on('message', (msg: unknown) => {
    if (typeof msg !== 'string') {
      console.log('msg is not a string');
      return;
    }
    ws.send(msg + ' from server');
  });
});


app.ws('/echo', (ws, _req: Request) => {
  ws.on('message', (msg: unknown) => {
    if (typeof msg !== 'string') {
      console.log('msg is not a string');
      return;
    }
    ws.send(msg + ' from server');
  });
});

// catch 404 and forward to error handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use(handleError);

export default app;
