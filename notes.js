const db = require('./database');

function createError(messageObj, code) {
  return {
    error: messageObj,
    code,
  };
}

function validate(title, text, datetime) {
  const errors = [];
  const isoRegex = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
  const isDatetimeValid = isoRegex.test(datetime);

  if (!isDatetimeValid) {
    errors.push({
      field: 'datetime',
      message: 'Datetime must be ISO 8601 date',
    });
  }

  const isTitleValid = title.length > 0;
  if (!isTitleValid) {
    errors.push({
      field: 'title',
      message: 'Title must be a string of length 1 to 255 characters',
    });
  }

  const isTextValid = typeof text === 'string';
  if (!isTextValid) {
    errors.push({
      field: 'text',
      message: 'Text must be a string',
    });
  }
  return errors;
}

/**
 * Create a note asynchronously.
 *
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function create({ title, text, datetime } = {}) {
  const errorMessage = validate(title, text, datetime);
  if (errorMessage.length > 0) {
    return createError(errorMessage, 400);
  }
  const query = 'INSERT INTO Notes(title, text, datetime) VALUES($1, $2, $3::timestamp) returning id;';
  const params = [title, text, datetime];
  try {
    const idsAffected = await db.query(query, params);

    return {
      id: idsAffected[0].id,
      title,
      text,
      datetime,
    };
  } catch (e) {
    return createError({ error: e.message }, 400);
  }
}

/**
 * Read all notes.
 *
 * @returns {Promise} Promise representing an array of all note objects
 */
async function readAll() {
  const query = 'SELECT * FROM Notes;';
  const params = [];
  try {
    const result = await db.query(query, params);
    return result;
  } catch (e) {
    return createError({ error: e.message }, 400);
  }
}

/**
 * Read a single note.
 *
 * @param {number} id - Id of note
 *
 * @returns {Promise} Promise representing the note object or null if not found
 */
async function readOne(id) {
  if (Number.isNaN(parseInt(id, 10))) {
    return createError({ error: 'Invalid id' }, 400);
  }

  const query = 'SELECT * FROM Notes WHERE id=$1;';
  const params = [id];
  const result = await db.query(query, params);
  if (result.length > 0) {
    return result[0];
  }
  return createError({ error: 'Note not found' }, 404);
}

/**
 * Update a note asynchronously.
 *
 * @param {number} id - Id of note to update
 * @param {Object} note - Note to create
 * @param {string} note.title - Title of note
 * @param {string} note.text - Text of note
 * @param {string} note.datetime - Datetime of note
 *
 * @returns {Promise} Promise representing the object result of creating the note
 */
async function update(id, { title, text, datetime } = {}) {
  if (Number.isNaN(parseInt(id, 10))) {
    return createError({ error: 'Invalid id' }, 400);
  }

  const errorMessage = validate(title, text, datetime);
  if (errorMessage.length > 0) {
    return errorMessage;
  }
  const query = 'UPDATE Notes SET title=$1, text=$2, datetime=$3 WHERE id=$4 returning id;';
  const params = [title, text, datetime, id];

  try {
    const results = await db.query(query, params);
    if (results.length > 0) {
      return {
        id: results[0].id,
        title,
        text,
        datetime,
      };
    }
    return createError({ error: 'Note not found' }, 404);
  } catch (error) {
    return createError({ error: error.message }, 400);
  }
}

/**
 * Delete a note asynchronously.
 *
 * @param {number} id - Id of note to delete
 *
 * @returns {Promise} Promise representing the boolean result of creating the note
 */
async function del(id) {
  const query = 'DELETE FROM Notes WHERE id=$1';
  const params = [id];
  try {
    await db.query(query, params);
    return 200;
  } catch (err) {
    return 404;
  }
}

module.exports = {
  create,
  readAll,
  readOne,
  update,
  del,
};
