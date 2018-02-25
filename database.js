const { Client } = require('pg');

exports.query = async (query, params) => {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const result = database.query(query, params);

    const { rows } = result;
    return rows;
  } catch (err) {
    console.error('Error running query');
    throw err;
  } finally {
    client.end();
  }
};
