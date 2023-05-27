import express from 'express';
const recordsRouter = express.Router();
import Record from '../models/record';

// mongoose get for records
recordsRouter.get('/', (request, response) => {
  (async () => {
    if (request.query.limit === undefined) {
      const records = await Record.find();
      response.json(records);
      return;
    }
    if (typeof request.query.limit !== 'string') {
      response.status(400).send({ error: 'limit malformed' });
      return;
    }
    const limit = parseInt(request.query.limit);
    if (isNaN(limit)) {
      response.status(400).send({ error: 'limit must be a valid number' });
      return;
    }
    const records = await Record.find().sort({ timestamp: -1 }).limit(limit);
    response.json(records.reverse());
  })().catch((error) => {
    console.log(error);
    response.status(500).send({ error: 'something went wrong' });
  });
});

// mongoose post for records
recordsRouter.post('/', (request, response) => {
  (async () => {
    const body = request.body;
    console.log(body);
    if (!body) {
      return response.status(400).json({
        error: 'content missing'
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
      response.status(400).send({ error: 'invalid data' });
    }
    return;
  })().catch((error) => {
    console.log(error);
    response.status(500).send({ error: 'something went wrong' });
  });
});

// mongoose get for records with id
recordsRouter.get('/:id', (request, response) => {
  (async () => {
    const record = await Record.findById(request.params.id);
    if (record) {
      response.json(record);
    } else {
      response.status(404).end();
    }
  });
});

// mongoose delete for records with id
recordsRouter.delete('/:id', (request, response) => {
  (async () => {
    await Record.findByIdAndRemove(request.params.id);
    response.status(204).end();
  })().catch((error) => {
    console.log(error);
    response.status(500).send({ error: 'something went wrong' });
  });
});

// mongoose delete all
recordsRouter.delete('/', (_request, response) => {
  (async () => {
    await Record.deleteMany({});
    response.status(204).end();
  })().catch((error) => {
    console.log(error);
    response.status(500).send({ error: 'something went wrong' });
  });
});

export default recordsRouter;
