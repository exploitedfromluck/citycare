const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    const existing = await User.findOne({ email: "admin@citycare.com" });
    if (existing) {
      console.log("Admin already exists, skipping.");
    } else {
      await User.create({
        name: "Admin",
        email: "admin@citycare.com",
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Admin user created: admin@citycare.com / admin123");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seedAdmin();
