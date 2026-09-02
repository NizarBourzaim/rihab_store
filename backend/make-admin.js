const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const email = "nizar.bourzaim2@gmail.com"; // Your email
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found! Make sure you have registered first.");
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`SUCCESS: ${email} is now an Admin!`);
    console.log("Now log out and log back in on the website to see the changes.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

makeAdmin();
