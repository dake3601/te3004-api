const Record = require("../models/record");

const esp32Clients = [];

const browserClients = [];

function esp32(ws, req) {

  esp32Clients.push(ws);
  console.log('ESP32 connected');

  ws.timer = setInterval(() => { ws.send("ping") }, 5000);

  ws.on('message', function (msg) {
    if (msg === "pong") return;
    if (msg === "ping") {
      ws.send("pong");
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

  ws.on('close', function () {
    esp32Clients.splice(esp32Clients.indexOf(ws), 1);
    console.log('ESP32 disconnected');
    clearInterval(ws.timer);
  });
}

function commands(ws, req) {

  ws.timer = setInterval(() => { ws.send("ping") }, 5000);

  ws.on('message', function (msg) {
    if (msg === "pong") return;
    if (msg === "ping") {
      ws.send("pong");
      return;
    }

    esp32Clients.forEach((client) => {
      client.send(msg);
    });
  });

  ws.on('close', function () {
    clearInterval(ws.timer);
  });
}

function updates(ws, req) {

  ws.timer = setInterval(() => { ws.send("ping") }, 5000);

  browserClients.push(ws);

  ws.on('message', function (msg) {
    if (msg === "pong") return;
    if (msg === "ping") {
      ws.send("pong");
      return;
    }
  });

  ws.on('close', function () {
    browserClients.splice(browserClients.indexOf(ws), 1);
    clearInterval(ws.timer);
  });
}

module.exports = { esp32, commands, updates };
