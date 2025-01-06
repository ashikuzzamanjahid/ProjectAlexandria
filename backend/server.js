const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();
const Course = require("./models/Course");
const Topic = require("./models/Topic");
const Resource = require("./models/Resource");
const LinksInfo = require("./models/LinksInfo");

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

        const resource = await Resource.findOne({ courseid, topic });
        if (!resource) {
            console.log("No resource found for:", courseid, topic);
            return res.json({ links: [] });
        }

        console.log("Resource fetched:", resource);

        const linksInfo = await LinksInfo.find({ topic });
        console.log("LinksInfo fetched for topic:", topic, JSON.stringify(linksInfo, null, 2));

        // Map the links with additional information
        const mappedLinks = resource.links.map((url) => {
            const linkInfo = linksInfo.find((info) => info.url === url);
            return {
                url,
                description: linkInfo ? linkInfo.description : "",
                likes: linkInfo ? linkInfo.likes : 0,
                dislikes: linkInfo ? linkInfo.dislikes : 0,
            };
        });

        // Send the combined response
        res.json({
            courseid: resource.courseid,
            topic: resource.topic,
            links: mappedLinks,
        });
    } catch (error) {
        console.error("Error fetching resource data:", error);
        res.status(500).json({ error: "Failed to fetch resource data" });
    }
});


app.get("/test-linksinfo/:topic", async (req, res) => {
    try {
        const topic = req.params.topic;
        const linksInfo = await LinksInfo.find({ topic });

        console.log("Fetched linksInfo:", linksInfo);
        res.json(linksInfo);
    } catch (error) {
        console.error("Error fetching linksInfo:", error);
        res.status(500).json({ error: "Failed to fetch linksInfo" });
    }
});








app.post("/api/resources/:courseid/:topic/like", async (req, res) => {
    try {
        const { courseid, topic } = req.params;
        const { url } = req.body;
        const linkInfo = await LinksInfo.findOneAndUpdate(
            { topic, url },
            { $inc: { likes: 1 } },
            { new: true, upsert: true }
        );
        res.json({ likes: linkInfo.likes });
    } catch (error) {
        console.error("Error updating likes:", error);
        res.status(500).json({ error: "Failed to update likes" });
    }
});

app.post("/api/resources/:courseid/:topic/dislike", async (req, res) => {
    try {
        const { courseid, topic } = req.params;
        const { url } = req.body;
        const linkInfo = await LinksInfo.findOneAndUpdate(
            { topic, url },
            { $inc: { dislikes: 1 } },
            { new: true, upsert: true }
        );
        res.json({ dislikes: linkInfo.dislikes });
    } catch (error) {
        console.error("Error updating dislikes:", error);
        res.status(500).json({ error: "Failed to update dislikes" });
    }
});

app.post("/api/resources/:courseid/:topic/description", async (req, res) => {
    try {
        const { courseid, topic } = req.params;
        const { url, description } = req.body;
        const linkInfo = await LinksInfo.findOneAndUpdate(
            { topic, url },
            { description },
            { new: true, upsert: true }
        );
        res.json({ description: linkInfo.description });
    } catch (error) {
        console.error("Error updating description:", error);
        res.status(500).json({ error: "Failed to update description" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

