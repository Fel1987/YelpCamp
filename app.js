const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");

const app = express();
const PORT = process.env.PORT || 3000;

// Models imports
const Campground = require("./models/campground");
const Review = require("./models/review");

// Routes Imports
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

//Mongoose Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Conected to DB"))
  .catch((error) => console.log(error));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/review", reviews);

app.get("/", (req, res) => {
  res.render("index");
});

// 404 Middleware
app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Resource not found", 404));
});

// Error handler middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Something Went Wrong!";

  res.status(statusCode).render("error", { err });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
