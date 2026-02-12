// db.js

// This module assumes PouchDB is loaded via a <script> tag in the HTML.
const db = new PouchDB('juris-db');

// Sync with remote CouchDB via the server proxy
const remoteDB = window.location.origin + '/db-proxy';
db.sync(remoteDB, {
  live: true,
  retry: true
}).on('change', function (info) {
  console.log('Sync change:', info);
}).on('paused', function (err) {
  console.log('Sync paused:', err);
}).on('active', function () {
  console.log('Sync active');
}).on('denied', function (err) {
  console.error('Sync denied:', err);
}).on('error', function (err) {
  console.error('Sync error:', err);
});

export const dbService = {
  /**
   * Creates a new document in the database.
   * @param {object} doc - The document to create.
   * @returns {Promise<object>} The result from the database.
   */
  async create(doc) {
    try {
      const res = await db.post(doc);
      return res;
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  },

  /**
   * Reads a document from the database by its ID.
   * @param {string} id - The ID of the document to read.
   * @returns {Promise<object>} The document.
   */
  async read(id) {
    try {
      const doc = await db.get(id);
      return doc;
    } catch (err) {
      console.error(`Error reading document "${id}":`, err);
      throw err;
    }
  },

  /**
   * Updates an existing document. The document must have _id and _rev properties.
   * @param {object} doc - The document to update.
   * @returns {Promise<object>} The result from the database.
   */
  async update(doc) {
    try {
      const res = await db.put(doc);
      return res;
    } catch (err) {
      console.error(`Error updating document "${doc._id}":`, err);
      throw err;
    }
  },

  /**
   * Writes a document to the database. Can be used for creating or updating.
   * If the document has an _id, it will be an update, otherwise a create.
   * @param {object} doc - The document to write.
   * @returns {Promise<object>} The result from the database.
   */
  async write(doc) {
    try {
      // If doc has _id, it's an update (or create with specific id).
      // If not, it will be a create with a generated id.
      if (doc._id) {
        return await db.put(doc);
      } else {
        return await db.post(doc);
      }
    } catch (err)
    {
        // if it is an update conflict, we should try to get the latest revision and apply the changes
        if (err.name === 'conflict') {
            try {
                const existingDoc = await db.get(doc._id);
                doc._rev = existingDoc._rev;
                return await db.put(doc);
            } catch (e) {
                console.error(`Error writing document after conflict:`, e);
                throw e;
            }
        } else {
            console.error(`Error writing document:`, err);
            throw err;
        }
    }
  },

  /**
   * Deletes a document from the database.
   * @param {object|string} docOrId - The document or its ID to delete.
   * @returns {Promise<object>} The result from the database.
   */
  async delete(docOrId) {
    try {
        let doc;
        if (typeof docOrId === 'string') {
            doc = await db.get(docOrId);
        } else {
            doc = docOrId;
        }
        return await db.remove(doc);
    } catch (err) {
      console.error(`Error deleting document:`, err);
      throw err;
    }
  },

  /**
   * Queries the database using allDocs().
   * @param {object} options - Options for the allDocs() method.
   * @returns {Promise<object>} The result of the query.
   */
  async query(options) {
    try {
      const result = await db.allDocs(options);
      return result;
    } catch (err) {
      console.error('Error querying documents:', err);
      throw err;
    }
  },

  /**
   * Watches for changes in the database.
   * @param {function} callback - Function called when a change occurs.
   * @returns {object} The changes listener which can be canceled.
   */
  watch(callback) {
    return db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', callback);
  }
};
