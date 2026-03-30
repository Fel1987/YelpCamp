const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
  title: {
    type: String,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
