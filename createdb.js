const fs = require('fs');
const util = require('util');
const database = require('./database');

const readFileAsync = util.promisify(fs.readFile);

const schemaFile = './schema.sql';

async function create() {
  const data = await readFileAsync(schemaFile);

  await database.query(data.toString('utf-8'), []);

  console.info('Schema created');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
