const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const Joi = require("joi");
const { campgroundBodySchema } = require("./schemas");
const app = express();
const PORT = process.env.PORT || 3000;

const Campground = require("./models/campground");

const db = mongoose.connection;

const validatedCampground = (req, res, next) => {
  const { error } = campgroundBodySchema.validate(req.body);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(",");
    throw new ExpressError(errorMessage, 400);
  } else {
    next();
  }
};

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Conected to DB"))
  .catch((error) => console.log(error));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use("/static/", express.static(path.join(__dirname, "src")));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  }),
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validatedCampground,
  catchAsync(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  }),
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render("campgrounds/show", { foundCampground });
  }),
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundCampground = await Campground.findById(id);
    res.render("campgrounds/edit", { foundCampground });
  }),
);

app.put(
  "/campgrounds/:id",
  validatedCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const editedCampground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      {
        runValidators: true,
        new: true,
      },
    );

    res.redirect(`/campgrounds/${id}`);
  }),
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);

    res.redirect("/campgrounds");
  }),
);

app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Resource not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Something Went Wrong!";

  res.status(statusCode).render("error", { err });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
