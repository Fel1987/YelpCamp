const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { campgroundReviewSchema } = require("../schemas");

//Models
const Campground = require("../models/campground");
const Review = require("../models/review");

// Validates review req.body via JOI
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

//Routes
router.post(
  "/",
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

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const foundCampground = await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    const foundReview = await Review.findByIdAndDelete(reviewId);

    res.redirect("/campgrounds/" + id);
  }),
);

module.exports = router;
