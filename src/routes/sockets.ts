import { Request } from 'express';
import Record from '../models/record';
import type { WebSocket } from 'ws';

interface WebSocketWithTimer extends WebSocket {
  timer: NodeJS.Timeout | undefined
}

const esp32Clients: WebSocket[] = [];

const browserClients: WebSocket[] = [];

const pingTime = 30000;

const esp32 = (ws: WebSocketWithTimer, _req: Request) => {
  esp32Clients.push(ws);
  console.log('ESP32 connected');

  ws.timer = setInterval(() => { ws.send('ping'); }, pingTime);

  ws.on('message', (msg: string) => {
    if (msg === 'pong') return;
    if (msg === 'ping') {
      ws.send('pong');
      return;
    }

    const body = JSON.parse(msg);
    const record = new Record({
      timestamp: new Date(body.timestamp),
      direction: body.direction,
      setSpeed: body.setSpeed,
      voltage: body.voltage,
      current: body.current,
      speed: body.speed
    });

    try {
      record.save();

      browserClients.forEach((client) => {
        client.send(JSON.stringify(record));
      });
    } catch (exception) {
      console.log(exception);
    }
  });

  ws.on('close', () => {
    esp32Clients.splice(esp32Clients.indexOf(ws), 1);
    console.log('ESP32 disconnected');
    clearInterval(ws.timer);
  });
};

const commands = (ws: WebSocketWithTimer, _req: Request) => {
  ws.timer = setInterval(() => { ws.send('ping'); }, pingTime);

  ws.on('message', (msg: string) => {
    if (msg === 'pong') return;
    if (msg === 'ping') {
      ws.send('pong');
      return;
    }

    esp32Clients.forEach((client) => {
      client.send(msg);
    });
  });

  ws.on('close', function () {
    clearInterval(ws.timer);
  });
};

const updates = (ws: WebSocketWithTimer, _req: Request) => {
  ws.timer = setInterval(() => { ws.send('ping'); }, pingTime);

  browserClients.push(ws);

  ws.on('message', (msg: string) => {
    if (msg === 'pong') return;
    if (msg === 'ping') {
      ws.send('pong');
    }
  });

  ws.on('close', function () {
    browserClients.splice(browserClients.indexOf(ws), 1);
    clearInterval(ws.timer);
  });
};

export { esp32, commands, updates };
