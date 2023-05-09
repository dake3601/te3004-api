const Record = require("../models/record");

const esp32Clients = [];

const browserClients = [];

function esp32(ws, req) {

  esp32Clients.push(ws);
  console.log('ESP32 connected');

  ws.on('message', function (body) {
    body = JSON.parse(body);
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

  ws.on('close', function () {
    esp32Clients.splice(esp32Clients.indexOf(ws), 1);
    console.log('ESP32 disconnected');
  });
}

function commands(ws, req) {
  ws.on('message', function (msg) {
    esp32Clients.forEach((client) => {
      client.send(msg);
    });
  });
}

function updates(ws, req) {
  browserClients.push(ws);
  ws.on('close', function () {
    browserClients.splice(browserClients.indexOf(ws), 1);
  });
}

module.exports = { esp32, commands, updates };
