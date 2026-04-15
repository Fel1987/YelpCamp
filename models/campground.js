const mongoose = require("mongoose");
const Review = require("./review");
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
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
});

campgroundSchema.post("findOneAndDelete", async function (document) {
  if (document) {
    await Review.deleteMany({
      _id: { $in: document.reviews },
    });
  }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
