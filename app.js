const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const catchAsync = require("./utilities/catchAsync");
const { campgroundBodySchema, campgroundReviewSchema } = require("./schemas");
const app = express();
const PORT = process.env.PORT || 3000;

const Campground = require("./models/campground");
const Review = require("./models/review");

const validator = (req, res, next, obj) => {
  const { error } = obj.validate(req.body);

  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(",");
    throw new ExpressError(errorMessage, 400);
  } else {
    next();
  }
};

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

const validateReview = (req, res, next) => {
  const { error } = campgroundReviewSchema.validate(req.body);

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
    const foundCampground = await Campground.findById(id).populate("reviews");
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

app.post(
  "/campgrounds/:id/review",
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { body, rating } = req.body.review;
    const foundCampground = await Campground.findById(id);
    const newReview = new Review({ body, rating });
    foundCampground.reviews.push(newReview);

    await newReview.save();
    await foundCampground.save();

    res.redirect(`/campgrounds/${foundCampground._id}`);
  }),
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    const foundReview = await Review.findByIdAndDelete(reviewId);

    res.redirect("/campgrounds/" + id);
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
