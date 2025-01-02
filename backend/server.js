const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
const Course = require("./models/Course");
const Topic = require("./models/Topic");
const Resource = require("./models/Resource");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/courselibrary")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// API Endpoints
app.get("/api/topics", async (req, res) => {
    try {
        const courses = await Course.find({}, "courseid coursename");
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch courses" });
    }
});

app.get("/api/alltopics", async (req, res) => {
    try {
        const topics = await Topic.find({});
        res.json(topics.flatMap(topic => topic.topics));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch topics" });
    }
});

app.get("/api/allresources", async (req, res) => {
    try {
        const resources = await Resource.find({});
        res.json(resources.flatMap(r => r.links.map(link => ({ courseid: r.courseid, topic: r.topic, link }))));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch resources" });
    }
});

app.get("/api/topics/:courseid", async (req, res) => {
    try {
        const { courseid } = req.params;
        const course = await Course.findOne({ courseid });
        if (!course) return res.status(404).json({ message: "Course not found" });

        const topics = await Topic.findOne({ courseid });
        if (!topics) return res.status(404).json({ message: "Topics not found" });

        res.json({
            courseid: course.courseid,
            coursename: course.coursename,
            numberOfTopics: topics.topics.length,
            topics: topics.topics
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch course details" });
    }
});

app.get("/api/resources/:courseid/:topic", async (req, res) => {
    try {
        const { courseid, topic } = req.params;
        // Fetch resources based on courseid and topic
        const resources = await Resource.findOne({ courseid, topic });
        
        if (!resources) {
            return res.json({ link: [] }); // Return empty array if no resources found
        }

        res.json(resources); // Otherwise, return the resources
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

