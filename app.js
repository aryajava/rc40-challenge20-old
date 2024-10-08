import express from "express";
import path from "path";
import sqlite3 from "sqlite3";
import dataRouter from "./routes/data.js";

export const db = new sqlite3.Database("./db/users.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the users database.");
});

const app = express();
const __dirname = import.meta.dirname;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/", dataRouter(db));

app.use((req, res, next) => {
  res.status(404).render("error", {
    message: "Page Not Found",
    error: { status: 404, stack: "" },
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.render("error", {
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
