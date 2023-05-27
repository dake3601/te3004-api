import express from 'express';
const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function (_req, res, _next) {
  res.render('index', { title: 'TE3004' });
});

export default indexRouter;
