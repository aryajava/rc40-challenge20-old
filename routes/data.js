import { Router } from "express";
import { db } from "../app.js";
const router = Router();

// Browse (Pagination & Search)
router.get("/", (req, res) => {
  const { page = 1 } = req.query;
  const limit = 5;
  const offset = (page - 1) * limit;
  const { name, height, weight, startdate, lastdate, married, operation = "AND" } = req.query;

  // Query untuk mengambil data
  let query = "SELECT * FROM data WHERE 1=1 ";
  let totalCountQuery = "SELECT COUNT(*) AS count FROM data WHERE 1=1";
  let params = [];

  // Tambahkan kondisi untuk totalCountQuery
  if (name) {
    totalCountQuery += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (height) {
    totalCountQuery += " AND height = ?";
    params.push(height);
  }
  if (weight) {
    totalCountQuery += " AND weight = ?";
    params.push(weight);
  }
  if (startdate) {
    totalCountQuery += " AND birthdate >= ?";
    params.push(startdate);
  }
  if (lastdate) {
    totalCountQuery += " AND birthdate <= ?";
    params.push(lastdate);
  }
  if (married) {
    totalCountQuery += " AND married = ?";
    params.push(married === "Yes" ? 1 : 0);
  }

  // Log untuk debugging
  console.log("Total Count Query:", totalCountQuery);
  console.log("Params for Count:", params);

  // Jalankan query untuk mendapatkan total count
  db.get(totalCountQuery, params, (err, row) => {
    if (err) {
      console.error("Error fetching total count:", err);
      return res.status(500).send("Error fetching total count.");
    }
    const totalItems = row.count;
    console.log("Total items:", totalItems);

    // Reset query untuk pengambilan data
    params = []; // Reset params untuk pengambilan data

    // Tambahkan kondisi untuk query utama yang mengambil data
    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (height) {
      query += " AND height = ?";
      params.push(height);
    }
    if (weight) {
      query += " AND weight = ?";
      params.push(weight);
    }
    if (startdate) {
      query += " AND birthdate >= ?";
      params.push(startdate);
    }
    if (lastdate) {
      query += " AND birthdate <= ?";
      params.push(lastdate);
    }
    if (married) {
      query += " AND married = ?";
      params.push(married === "Yes" ? 1 : 0);
    }

    // Tambahkan LIMIT dan OFFSET
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // Log untuk debugging
    console.log("Query for fetching data:", query);
    console.log("Params for fetching data:", params);

    // Jalankan query untuk mengambil data
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).send(err.message);
      }

      // Cek apakah request berasal dari AJAX (fetch) atau HTML biasa
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        // Jika request berasal dari AJAX, kirimkan data dalam format JSON
        res.json({ rows, totalItems });
      } else {
        // Jika request dari browser biasa, render halaman HTML
        res.render("index", {
          data: rows,
          currentPage: page,
          totalItems,
          searchParams: req.query,
        });
      }
    });
  });
});

// Add
// Render Add Form
router.get("/add", (req, res) => {
  res.render("add");
});
// Add Save
router.post("/add", (req, res) => {
  const { name, height, weight, birthdate, married } = req.body;
  db.run(
    `INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)`,
    [name, height, weight, birthdate, married === "Yes" ? 1 : 0],
    (err) => {
      if (err) return res.status(500).send(err.message);
      res.redirect("/");
    }
  );
});

// Edit
// Route untuk menampilkan halaman edit
router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM data WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!row) {
      return res.status(404).send("Data not found");
    }
    res.render("edit", { data: row });
  });
});

// Route untuk memperbarui data
router.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const { name, height, weight, birthdate, married } = req.body;

  // Validasi input
  if (!name) {
    return res.status(400).send("Name is required");
  }

  db.run(
    "UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?",
    [name, height, weight, birthdate, married === "Yes" ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).send(err.message);
      }
      res.redirect("/");
    }
  );
});

// // Render Edit Form
// router.get("/edit/:id", (req, res) => {
//   const { id } = req.params;
//   db.get("SELECT * FROM data WHERE id = ?", [id], (err, row) => {
//     if (err) return res.status(500).send(err.message);
//     res.render("edit", { data: row });
//   });
// });
// // Edit Save
// router.post("/edit/:id", (req, res) => {
//   const { id } = req.params;
//   const { name, height, weight, birthdate, married } = req.body;
//   db.run(
//     `UPDATE data SET name = ?, height = ?, weight = ?, birthdate = ?, married = ? WHERE id = ?`,
//     [name, height, weight, birthdate, married === "Yes" ? 1 : 0, id],
//     (err) => {
//       if (err) return res.status(500).send(err.message);
//       res.redirect("/");
//     }
//   );
// });

// Delete
router.post("/delete/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM data WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect("/");
  });
});

export default router;
