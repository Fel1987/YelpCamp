const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

const Campground = require("./models/campground");

const db = mongoose.connection;

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Conected to DB"))
  .catch((error) => console.log(error));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});

  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  const newCampground = new Campground(req.body.campground);

  await newCampground.save();

  res.redirect(`/campgrounds/${newCampground._id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const foundCampground = await Campground.findById(id);

  res.render("campgrounds/show", { foundCampground });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
