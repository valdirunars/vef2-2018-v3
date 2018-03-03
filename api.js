const express = require('express');

const {
  create,
  readAll,
  readOne,
  update,
  del,
} = require('./notes');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.get('/', catchErrors(async (req, res) => {
  const results = await readAll();
  if (results.code) {
    res.statusCode = results.code;
    res.json(results.error);
  } else {
    res.json(results);
  }
}));

router.get('/:id', catchErrors(async (req, res) => {
  const item = await readOne(req.params.id);
  if (item.code) {
    res.statusCode = item.code;
    res.json(item.error);
  } else {
    res.json(item);
  }
}));

router.post('/', catchErrors(async (req, res) => {
  const result = await create(req.body);
  if (result.code) {
    res.statusCode = result.code;
    res.json(result.error);
  } else {
    res.json(result);
  }
}));

router.put('/:id', catchErrors(async (req, res) => {
  const result = await update(req.params.id, req.body);
  if (result.code) {
    res.statusCode = result.code;
    res.json(result.error);
  } else {
    res.json(result);
  }
}));

router.delete('/:id', catchErrors(async (req, res) => {
  const result = await del(req.params.id);
  res.statusCode = result;
  res.send('');
}));

module.exports = router;
