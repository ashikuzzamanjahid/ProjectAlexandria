const bcrypt = require("bcrypt");

const Course = require("../models/Course");
const Topic = require("../models/Topic");
const Resource = require("../models/Resource");
const LinksInfo = require("../models/LinksInfo");
const User = require("../models/User");
const ResourceSubmission = require("../models/ResourceSubmission");
const ResourceReport = require("../models/ResourceReport");
const ResourceVote = require("../models/ResourceVote");

async function seedDatabase({ reset = false } = {}) {
    if (reset) {
        await Promise.all([
            Course.deleteMany({}),
            Topic.deleteMany({}),
            Resource.deleteMany({}),
            LinksInfo.deleteMany({}),
            User.deleteMany({}),
            ResourceSubmission.deleteMany({}),
            ResourceReport.deleteMany({}),
            ResourceVote.deleteMany({}),
        ]);
    }

    const existingCourses = await Course.countDocuments();
    const existingUsers = await User.countDocuments();
    if (!reset && existingCourses > 0 && existingUsers > 0) {
        return { seeded: false, reason: "existing-data" };
    }

    const adminPasswordHash = await bcrypt.hash("admin1234", 12);
    const studentPasswordHash = await bcrypt.hash("student1234", 12);

    const [adminUser, studentUser] = await User.create([
        {
            email: "admin@alexandria.test",
            displayName: "Admin User",
            role: "admin",
            passwordHash: adminPasswordHash,
        },
        {
            email: "student@alexandria.test",
            displayName: "Student User",
            role: "student",
            passwordHash: studentPasswordHash,
        },
    ]);

    await Course.create([
        { courseid: "CSE420", coursename: "Compiler Design", numberOfTopics: 3 },
        { courseid: "CSE370", coursename: "Database Systems", numberOfTopics: 3 },
    ]);

    await Topic.create([
        { courseid: "CSE420", topics: ["Lexical Analysis", "Parsing", "Code Generation"] },
        { courseid: "CSE370", topics: ["ER Model", "Normalization", "SQL Optimization"] },
    ]);

    await Resource.create([
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "videos",
            links: [
                "https://www.youtube.com/playlist?list=PL-parsing-1",
                "https://www.youtube.com/playlist?list=PL-parsing-2",
                "https://www.youtube.com/playlist?list=PL-parsing-3",
            ],
        },
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "slides",
            links: ["https://example.com/compiler/parsing-slides"],
        },
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "notes",
            links: ["https://example.com/compiler/parsing-notes"],
        },
        {
            courseid: "CSE370",
            topic: "Normalization",
            section: "videos",
            links: ["https://www.youtube.com/playlist?list=PL-db-normalization"],
        },
        {
            courseid: "CSE370",
            topic: "Normalization",
            section: "resources",
            links: ["https://example.com/db/normalization-guide"],
        },
    ]);

    await LinksInfo.create([
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "videos",
            url: "https://www.youtube.com/playlist?list=PL-parsing-1",
            description: "Playlist focused on top-down parsing with worked examples.",
            likes: 8,
            dislikes: 1,
        },
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "videos",
            url: "https://www.youtube.com/playlist?list=PL-parsing-2",
            description: "Bottom-up parsing walkthrough from another instructor.",
            likes: 5,
            dislikes: 0,
        },
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "slides",
            url: "https://example.com/compiler/parsing-slides",
            description: "Lecture slides covering LL and LR parser construction.",
            likes: 4,
            dislikes: 0,
        },
        {
            courseid: "CSE370",
            topic: "Normalization",
            section: "resources",
            url: "https://example.com/db/normalization-guide",
            description: "Compact article on 1NF to BCNF with examples.",
            likes: 7,
            dislikes: 1,
        },
    ]);

    await ResourceSubmission.create([
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "additional",
            url: "https://example.com/compiler/parser-cheatsheet",
            submittedBy: studentUser._id,
            status: "pending",
        },
    ]);

    await ResourceReport.create([
        {
            courseid: "CSE420",
            topic: "Parsing",
            section: "videos",
            url: "https://www.youtube.com/playlist?list=PL-parsing-3",
            reason: "broken",
            details: "Playlist link appears unavailable.",
            reportedBy: studentUser._id,
            status: "open",
        },
    ]);

    return {
        seeded: true,
        users: {
            admin: { email: "admin@alexandria.test", password: "admin1234" },
            student: { email: "student@alexandria.test", password: "student1234" },
        },
    };
}

module.exports = { seedDatabase };
