const mongoose = require("mongoose");
const Campground = require("./models/campground");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => console.log("Conected to DB"))
  .catch((error) => console.log(error));

const seedCities = async () => {
  await Campground.insertOne({
    title: "Test Title",
    price: "Test Price",
    description: "Test Description",
    location: "Test Location",
  });

  mongoose.connection.close();
};

seedCities();
