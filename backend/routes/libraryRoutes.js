const express = require("express");
const requireAuth = require("../middleware/auth");

const createLibraryRoutes = ({
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
}) => {
    const router = express.Router();

    router.get("/topics", async (req, res) => {
        try {
            const courses = await Course.find({}, "courseid coursename");
            return res.json(courses);
        } catch {
            return res.status(500).json({ error: "Failed to fetch courses" });
        }
    });

    router.get("/alltopics", async (req, res) => {
        try {
            const topics = await Topic.find({});
            return res.json(topics.flatMap((topic) => topic.topics));
        } catch {
            return res.status(500).json({ error: "Failed to fetch topics" });
        }
    });

    router.get("/allresources", async (req, res) => {
        try {
            const resources = await Resource.find({});
            const allLinks = resources.flatMap((resource) =>
                resource.links.map((url) => ({
                    courseid: resource.courseid,
                    topic: resource.topic,
                    section: resource.section,
                    link: url,
                }))
            );
            return res.json(allLinks);
        } catch {
            return res.status(500).json({ error: "Failed to fetch resources" });
        }
    });

    router.get("/topics/:courseid", async (req, res) => {
        try {
            const { courseid } = req.params;
            const course = await Course.findOne({ courseid });
            if (!course) return res.status(404).json({ message: "Course not found" });

            const topics = await Topic.findOne({ courseid });
            if (!topics) return res.status(404).json({ message: "Topics not found" });

            return res.json({
                courseid: course.courseid,
                coursename: course.coursename,
                numberOfTopics: topics.topics.length,
                topics: topics.topics,
            });
        } catch {
            return res.status(500).json({ error: "Failed to fetch course details" });
        }
    });

    router.get("/resources/:courseid/:topic", async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const resourceDocs = await Resource.find({ courseid, topic });
            if (resourceDocs.length === 0) {
                return res.json({ courseid, topic, links: [], sections: {} });
            }

            const linksInfo = await LinksInfo.find({ courseid, topic });
            const infoByKey = new Map(linksInfo.map((info) => [`${info.section}|${info.url}`, info]));

            const mappedLinks = resourceDocs.flatMap((doc) =>
                doc.links.map((url) => {
                    const linkInfo = infoByKey.get(`${doc.section}|${url}`);
                    return {
                        url,
                        section: doc.section,
                        description: linkInfo ? linkInfo.description : "",
                        likes: linkInfo ? linkInfo.likes : 0,
                        dislikes: linkInfo ? linkInfo.dislikes : 0,
                    };
                })
            );

            const sections = SECTION_TYPES.reduce((accumulator, section) => {
                accumulator[section] = mappedLinks.filter((link) => link.section === section);
                return accumulator;
            }, {});

            return res.json({ courseid, topic, links: mappedLinks, sections });
        } catch (error) {
            console.error("Error fetching resource data:", error);
            return res.status(500).json({ error: "Failed to fetch resource data" });
        }
    });

    router.post("/resources/:courseid/:topic", requireAuth, async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);

            if (!section) return res.status(400).json({ error: "Invalid section" });
            if (!cleanUrl) return res.status(400).json({ error: "url must be a valid http/https URL" });

            const course = await Course.findOne({ courseid });
            if (!course) return res.status(404).json({ error: "Course not found" });

            const topicDoc = await Topic.findOne({ courseid });
            if (!topicDoc || !topicDoc.topics.includes(topic)) {
                return res.status(404).json({ error: "Topic not found" });
            }

            const existingSubmission = await ResourceSubmission.findOne({
                courseid,
                topic,
                section,
                url: cleanUrl,
                status: "pending",
            });
            if (existingSubmission) {
                return res.status(409).json({ error: "This resource is already pending review" });
            }

            const submission = await ResourceSubmission.create({
                courseid,
                topic,
                section,
                url: cleanUrl,
                submittedBy: req.user.userId,
                status: "pending",
            });

            return res.status(201).json({
                message: "Submission received and sent for admin review",
                submissionId: submission._id,
                status: submission.status,
            });
        } catch (error) {
            console.error("Error submitting resource:", error);
            return res.status(500).json({ error: "Failed to submit resource" });
        }
    });

    router.post("/resources/:courseid/:topic/report", requireAuth, async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);
            const reason = String(req.body.reason || "").trim();
            const details = typeof req.body.details === "string" ? req.body.details.trim() : "";

            if (!section) return res.status(400).json({ error: "Invalid section" });
            if (!cleanUrl) return res.status(400).json({ error: "url must be a valid http/https URL" });
            if (!reason) return res.status(400).json({ error: "reason is required" });

            const exists = await resourceExists({ courseid, topic, section, url: cleanUrl });
            if (!exists) {
                return res.status(404).json({ error: "Resource link not found" });
            }

            const report = await ResourceReport.create({
                courseid,
                topic,
                section,
                url: cleanUrl,
                reason,
                details,
                reportedBy: req.user.userId,
                status: "open",
            });

            return res.status(201).json({ message: "Report submitted", reportId: report._id });
        } catch (error) {
            console.error("Error reporting resource:", error);
            return res.status(500).json({ error: "Failed to report resource" });
        }
    });

    router.post("/resources/:courseid/:topic/like", requireAuth, async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);

            if (!cleanUrl) return res.status(400).json({ error: "url is required" });
            if (!section) return res.status(400).json({ error: "Invalid section" });

            const exists = await resourceExists({ courseid, topic, section, url: cleanUrl });
            if (!exists) {
                return res.status(404).json({ error: "Resource link not found" });
            }

            const voteQuery = { userId: req.user.userId, courseid, topic, section, url: cleanUrl };
            const existingVote = await ResourceVote.findOne(voteQuery);

            let update = null;
            if (!existingVote) {
                await ResourceVote.create({ ...voteQuery, value: "like" });
                update = { $inc: { likes: 1 } };
            } else if (existingVote.value === "dislike") {
                existingVote.value = "like";
                await existingVote.save();
                update = { $inc: { likes: 1, dislikes: -1 } };
            }

            const linkInfo = update
                ? await LinksInfo.findOneAndUpdate(
                    { courseid, topic, section, url: cleanUrl },
                    update,
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                )
                : await LinksInfo.findOneAndUpdate(
                    { courseid, topic, section, url: cleanUrl },
                    {},
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );

            return res.json({ likes: linkInfo.likes });
        } catch (error) {
            console.error("Error updating likes:", error);
            return res.status(500).json({ error: "Failed to update likes" });
        }
    });

    router.post("/resources/:courseid/:topic/dislike", requireAuth, async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);

            if (!cleanUrl) return res.status(400).json({ error: "url is required" });
            if (!section) return res.status(400).json({ error: "Invalid section" });

            const exists = await resourceExists({ courseid, topic, section, url: cleanUrl });
            if (!exists) {
                return res.status(404).json({ error: "Resource link not found" });
            }

            const voteQuery = { userId: req.user.userId, courseid, topic, section, url: cleanUrl };
            const existingVote = await ResourceVote.findOne(voteQuery);

            let update = null;
            if (!existingVote) {
                await ResourceVote.create({ ...voteQuery, value: "dislike" });
                update = { $inc: { dislikes: 1 } };
            } else if (existingVote.value === "like") {
                existingVote.value = "dislike";
                await existingVote.save();
                update = { $inc: { likes: -1, dislikes: 1 } };
            }

            const linkInfo = update
                ? await LinksInfo.findOneAndUpdate(
                    { courseid, topic, section, url: cleanUrl },
                    update,
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                )
                : await LinksInfo.findOneAndUpdate(
                    { courseid, topic, section, url: cleanUrl },
                    {},
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                );

            return res.json({ dislikes: linkInfo.dislikes });
        } catch (error) {
            console.error("Error updating dislikes:", error);
            return res.status(500).json({ error: "Failed to update dislikes" });
        }
    });

    router.post("/resources/:courseid/:topic/description", requireAuth, async (req, res) => {
        try {
            const { courseid, topic } = req.params;
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);
            const { description } = req.body;

            if (!cleanUrl) return res.status(400).json({ error: "url is required" });
            if (!section) return res.status(400).json({ error: "Invalid section" });
            if (typeof description !== "string") {
                return res.status(400).json({ error: "description must be a string" });
            }

            const exists = await resourceExists({ courseid, topic, section, url: cleanUrl });
            if (!exists) {
                return res.status(404).json({ error: "Resource link not found" });
            }

            const linkInfo = await LinksInfo.findOneAndUpdate(
                { courseid, topic, section, url: cleanUrl },
                { description },
                { new: true, upsert: true }
            );

            return res.json({ description: linkInfo.description });
        } catch (error) {
            console.error("Error updating description:", error);
            return res.status(500).json({ error: "Failed to update description" });
        }
    });

    return router;
};

module.exports = { createLibraryRoutes };
