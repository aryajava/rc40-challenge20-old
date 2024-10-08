import { Router } from "express";
import { add, edit, getById, remove } from "../models/Data.js";
const router = Router();

export default (db) => {
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
