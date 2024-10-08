import { Router } from "express";
const router = Router();

export default (db) => {
  // model query
  const getById = (id, callback) => {
    db.get("SELECT * FROM data WHERE id = ?", [id], (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(new Error("No record found"));
      callback(null, row);
    });
  };

  const add = (name, height, weight, birthdate, married, callback) => {
    db.run("INSERT INTO data(name, height, weight, birthdate, married) VALUES(?, ?, ?, ?, ?)", [name, height, weight, birthdate, married], (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  };

  const update = (id, name, height, weight, birthdate, married, callback) => {
    db.run("UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?", [name, height, weight, birthdate, married, id], (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  };

  const edit = (id, name, height, weight, birthdate, married, callback) => {
    db.run("UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?", [name, height, weight, birthdate, married, id], (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  };

  const remove = (id, callback) => {
    db.run("DELETE FROM data WHERE id = ?", [id], (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  };

  // routes views
  router.get("/", (req, res, next) => {
    const page = req.query.page || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const { name, height, weight, startdate, lastdate, married, operation } = req.query;

    const conditions = [];
    const params = [];

    if (name) {
      conditions.push("name LIKE '%' || ? || '%'");
      params.push(name);
    }
    if (height) {
      conditions.push("height = ?");
      params.push(height);
    }
    if (weight) {
      conditions.push("weight = ?");
      params.push(weight);
    }
    if (startdate && lastdate) {
      conditions.push("birthdate BETWEEN ? AND ?");
      params.push(startdate, lastdate);
    } else if (startdate) {
      conditions.push("birthdate >= ?");
      params.push(startdate);
    } else if (lastdate) {
      conditions.push("birthdate <= ?");
      params.push(lastdate);
    }
    if (married) {
      conditions.push("married = ?");
      params.push(married);
    }

    let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(` ${operation} `)}` : "";
    let totalRecords = `SELECT COUNT(*) as total FROM data ${whereClause}`;

    db.get(totalRecords, params, (err, row) => {
      if (err) {
        return next(err);
      }
      const total = row.total;
      const pages = Math.ceil(total / limit);
      let query = `SELECT * FROM data ${whereClause} ORDER BY id ASC LIMIT ? OFFSET ?`;

      // Get the data from the database
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) {
          return next(err);
        }

        res.render("index", {
          title: "SQLite BREAD (Browse, Read, Edit, Add, Delete) and Pagination",
          data: rows,
          searchParams: req.query,
          total,
          page,
          pages,
        });
      });
    });
  });

  router.get("/add", (req, res, next) => {
    res.render("add", { title: "Adding Data" });
  });

  router.post("/add", (req, res, next) => {
    const { name, height, weight, birthdate, married } = req.body;
    add(name, height, weight, birthdate, married, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  router.get("/edit/:id", (req, res, next) => {
    const id = req.params.id;
    getById(id, (err, data) => {
      if (err) {
        return next(err);
      }
      res.render("edit", { title: "Updating Data", data });
    });
  });

  router.post("/edit/:id", (req, res, next) => {
    const id = req.params.id;
    const { name, height, weight, birthdate, married } = req.body;
    edit(id, name, height, weight, birthdate, married, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  router.post("/remove/:id", (req, res, next) => {
    const id = req.params.id;
    remove(id, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  return router;
};
