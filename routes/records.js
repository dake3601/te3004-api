const express = require('express');
const router = express.Router();
const Record = require("../models/record");

// mongoose get for records
router.get("/", async (request, response) => {
  const records = await Record.find({});
  response.json(records);
});

// mongoose post for records
router.post("/", async (request, response) => {
  const body = request.body;
  console.log(body);
  if (!body) {
    return response.status(400).json({
      error: "content missing"
    });
  }

  const record = new Record({
    timestamp: new Date(body.timestamp),
    direction: body.direction,
    setSpeed: body.setSpeed,
    voltage: body.voltage,
    current: body.current,
    speed: body.speed
  });

  try {
    const savedRecord = await record.save();
    response.json(savedRecord);
  } catch (exception) {
    console.log(exception);
    response.status(400).send({ error: "invalid data" });
  }
});

// mongoose get for records with id
router.get("/:id", async (request, response) => {
  try {
    const record = await Record.findById(request.params.id);
    if (record) {
      response.json(record);
    } else {
      response.status(404).end();
    }
  } catch (exception) {
    console.log(exception);
    response.status(400).send({ error: "malformatted id" });
  }
});

// mongoose delete for records with id
router.delete("/:id", async (request, response) => {
  await Record.findByIdAndRemove(request.params.id);
  response.status(204).end()
});

// mongoose delete all
router.delete("/", async (request, response) => {
  await Record.deleteMany({});
  response.status(204).end();
});

module.exports = router;
