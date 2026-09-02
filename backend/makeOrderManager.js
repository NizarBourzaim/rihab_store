const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/user");

dotenv.config();

const makeOrderManager = async () => {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email: node makeOrderManager.js example@email.com");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const user = await User.findOne({ email });

    if (!user) {
      console.error("User not found");
      process.exit(1);
    }

    user.isOrderManager = true;
    // Keep isAdmin as is, but usually a manager is NOT a full admin
    // user.isAdmin = false; 

    await user.save();

    console.log(`Success! ${email} is now an Order Manager.`);
    console.log("They can now manage orders but cannot delete them or manage products.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

makeOrderManager();
