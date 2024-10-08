import { db } from "../app.js";

export const getById = (id, callback) => {
  db.get("SELECT * FROM data WHERE id = ?", [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(new Error("No record found"));
    callback(null, row);
  });
};

export const add = (name, height, weight, birthdate, married, callback) => {
  db.run("INSERT INTO data(name, height, weight, birthdate, married) VALUES(?, ?, ?, ?, ?)", [name, height, weight, birthdate, married], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

export const update = (id, name, height, weight, birthdate, married, callback) => {
  db.run("UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?", [name, height, weight, birthdate, married, id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

export const edit = (id, name, height, weight, birthdate, married, callback) => {
  db.run("UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?", [name, height, weight, birthdate, married, id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

export const remove = (id, callback) => {
  db.run("DELETE FROM data WHERE id = ?", [id], (err) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};
