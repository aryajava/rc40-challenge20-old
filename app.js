import bodyParser from "body-parser";
import express from "express";
import path, { dirname } from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import dataRoutes from "./routes/data.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database setup
export const db = new sqlite3.Database("./users.db");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Routes
app.use("/", dataRoutes);

app.get("/", (req, res) => {
  res.redirect("/");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
