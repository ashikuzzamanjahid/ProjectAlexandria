const mongoose = require("mongoose");
const { seedDatabase } = require("./seedData");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/courselibrary";

async function main() {
    await mongoose.connect(MONGO_URL);
    const result = await seedDatabase({ reset: true });
    console.log("Seed complete.");
    console.log(`Admin login: ${result.users.admin.email} / ${result.users.admin.password}`);
    console.log(`Student login: ${result.users.student.email} / ${result.users.student.password}`);
    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
});
