const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src")));

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
