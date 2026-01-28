require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/user.model");

const test = async () => {
  await mongoose.connect(
    process.env.MONGO_URL || "mongodb://localhost:27017/smart_shuttle",
  );

  const admin = await User.findOne({ email: "admin@gttm.com" }).select(
    "+password",
  );

  console.log("✅ Admin exists:", !!admin);
  console.log("✅ Is verified:", admin?.isVerified);
  console.log("✅ Password field exists:", !!admin?.password);
  console.log(
    "✅ Password is hashed (bcrypt):",
    admin?.password?.startsWith("$2"),
  );

  if (admin) {
    const testPassword = await admin.comparePassword("admin123");
    console.log("✅ Password compare result:", testPassword);

    if (!testPassword) {
      console.log("\n❌ Password comparison FAILED!");
      console.log("Stored password hash:", admin.password);
    }
  }

  process.exit(0);
};

test().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
