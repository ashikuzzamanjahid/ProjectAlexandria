const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is required but missing in environment configuration.");
    process.exit(1);
}

const Course = require("./models/Course");
const Topic = require("./models/Topic");
const Resource = require("./models/Resource");
const LinksInfo = require("./models/LinksInfo");
const User = require("./models/User");
const ResourceSubmission = require("./models/ResourceSubmission");
const ResourceReport = require("./models/ResourceReport");
const ResourceVote = require("./models/ResourceVote");
const { seedDatabase } = require("./scripts/seedData");
const { createAuthRoutes } = require("./routes/authRoutes");
const { createLibraryRoutes } = require("./routes/libraryRoutes");
const { createAdminRoutes } = require("./routes/adminRoutes");
const {
    SECTION_TYPES,
    normalizeSection,
    validateHttpUrl,
    parsePagination,
} = require("./utils/requestUtils");
const { createResourceExists } = require("./utils/resourceUtils");

const app = express();
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/courselibrary";
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const resourceExists = createResourceExists(Resource);

app.use("/api/auth", createAuthRoutes({ User }));
app.use(
    "/api",
    createLibraryRoutes({
        Course,
        Topic,
        Resource,
        LinksInfo,
        ResourceSubmission,
        ResourceReport,
        ResourceVote,
        SECTION_TYPES,
        normalizeSection,
        validateHttpUrl,
        resourceExists,
    })
);
app.use(
    "/api/admin",
    createAdminRoutes({
        Resource,
        LinksInfo,
        ResourceSubmission,
        ResourceReport,
        ResourceVote,
        parsePagination,
        normalizeSection,
        validateHttpUrl,
    })
);

let memoryMongoServer = null;

const connectDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 3000 });
        console.log(`Connected to MongoDB: ${MONGO_URL}`);
        return { mode: "external" };
    } catch {
        console.warn("Local MongoDB unavailable. Falling back to in-memory MongoDB for testing.");
        memoryMongoServer = await MongoMemoryServer.create({ instance: { dbName: "courselibrary" } });
        const memoryUri = memoryMongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`Connected to in-memory MongoDB: ${memoryUri}`);
        return { mode: "memory" };
    }
};

const startServer = async () => {
    try {
        const db = await connectDatabase();
        const seedResult = await seedDatabase();
        if (seedResult.seeded) {
            console.log("Sample data seeded for testing.");
        }
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (${db.mode})`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        if (memoryMongoServer) {
            await memoryMongoServer.stop();
        }
        process.exit(1);
    }
};

startServer();
