const express = require("express");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");

const createAdminRoutes = ({
    Resource,
    LinksInfo,
    ResourceSubmission,
    ResourceReport,
    ResourceVote,
    parsePagination,
    normalizeSection,
    validateHttpUrl,
}) => {
    const router = express.Router();

    router.get("/submissions", requireAuth, requireAdmin, async (req, res) => {
        try {
            const status = String(req.query.status || "pending").toLowerCase();
            const query = ["pending", "approved", "rejected"].includes(status) ? { status } : {};
            const { page, limit, skip } = parsePagination(req.query);

            const [submissions, total] = await Promise.all([
                ResourceSubmission.find(query)
                    .populate("submittedBy", "email displayName")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                ResourceSubmission.countDocuments(query),
            ]);

            return res.json({
                items: submissions,
                total,
                page,
                limit,
                hasNextPage: skip + submissions.length < total,
            });
        } catch {
            return res.status(500).json({ error: "Failed to fetch submissions" });
        }
    });

    router.post("/submissions/:id/approve", requireAuth, requireAdmin, async (req, res) => {
        try {
            const submission = await ResourceSubmission.findById(req.params.id);
            if (!submission) return res.status(404).json({ error: "Submission not found" });
            if (submission.status !== "pending") {
                return res.status(400).json({ error: "Submission already reviewed" });
            }

            const resourceDoc = await Resource.findOneAndUpdate(
                { courseid: submission.courseid, topic: submission.topic, section: submission.section },
                { $addToSet: { links: submission.url } },
                { new: true, upsert: true }
            );

            submission.status = "approved";
            submission.reviewedBy = req.user.userId;
            submission.reviewedAt = new Date();
            submission.adminNote = typeof req.body.note === "string" ? req.body.note : "";
            await submission.save();

            return res.json({ message: "Submission approved", linksCount: resourceDoc.links.length });
        } catch (error) {
            console.error("Error approving submission:", error);
            return res.status(500).json({ error: "Failed to approve submission" });
        }
    });

    router.post("/submissions/:id/reject", requireAuth, requireAdmin, async (req, res) => {
        try {
            const submission = await ResourceSubmission.findById(req.params.id);
            if (!submission) return res.status(404).json({ error: "Submission not found" });
            if (submission.status !== "pending") {
                return res.status(400).json({ error: "Submission already reviewed" });
            }

            submission.status = "rejected";
            submission.reviewedBy = req.user.userId;
            submission.reviewedAt = new Date();
            submission.adminNote = typeof req.body.note === "string" ? req.body.note : "";
            await submission.save();

            return res.json({ message: "Submission rejected" });
        } catch {
            return res.status(500).json({ error: "Failed to reject submission" });
        }
    });

    router.get("/reports", requireAuth, requireAdmin, async (req, res) => {
        try {
            const status = String(req.query.status || "open").toLowerCase();
            const query = ["open", "resolved", "dismissed"].includes(status) ? { status } : {};
            const { page, limit, skip } = parsePagination(req.query);

            const [reports, total] = await Promise.all([
                ResourceReport.find(query)
                    .populate("reportedBy", "email displayName")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                ResourceReport.countDocuments(query),
            ]);

            return res.json({
                items: reports,
                total,
                page,
                limit,
                hasNextPage: skip + reports.length < total,
            });
        } catch {
            return res.status(500).json({ error: "Failed to fetch reports" });
        }
    });

    router.post("/reports/:id/resolve", requireAuth, requireAdmin, async (req, res) => {
        try {
            const report = await ResourceReport.findById(req.params.id);
            if (!report) return res.status(404).json({ error: "Report not found" });
            if (report.status !== "open") {
                return res.status(400).json({ error: "Report already handled" });
            }

            report.status = req.body.dismiss ? "dismissed" : "resolved";
            report.handledBy = req.user.userId;
            report.handledAt = new Date();
            await report.save();

            return res.json({ message: `Report ${report.status}` });
        } catch {
            return res.status(500).json({ error: "Failed to resolve report" });
        }
    });

    router.post("/resources/delete", requireAuth, requireAdmin, async (req, res) => {
        try {
            const courseid = String(req.body.courseid || "").trim();
            const topic = String(req.body.topic || "").trim();
            const section = normalizeSection(req.body.section);
            const cleanUrl = validateHttpUrl(req.body.url);

            if (!courseid || !topic) {
                return res.status(400).json({ error: "courseid and topic are required" });
            }
            if (!section) {
                return res.status(400).json({ error: "Invalid section" });
            }
            if (!cleanUrl) {
                return res.status(400).json({ error: "url must be a valid http/https URL" });
            }

            const resourceDoc = await Resource.findOneAndUpdate(
                { courseid, topic, section },
                { $pull: { links: cleanUrl } },
                { new: true }
            );

            await LinksInfo.deleteOne({ courseid, topic, section, url: cleanUrl });
            await ResourceVote.deleteMany({ courseid, topic, section, url: cleanUrl });

            const now = new Date();
            await ResourceReport.updateMany(
                { courseid, topic, section, url: cleanUrl, status: "open" },
                {
                    $set: {
                        status: "resolved",
                        handledBy: req.user.userId,
                        handledAt: now,
                    },
                }
            );

            if (resourceDoc && resourceDoc.links.length === 0) {
                await Resource.deleteOne({ _id: resourceDoc._id });
            }

            return res.json({
                message: "Resource deleted",
                removed: !!resourceDoc,
                courseid,
                topic,
                section,
                url: cleanUrl,
            });
        } catch (error) {
            console.error("Error deleting resource:", error);
            return res.status(500).json({ error: "Failed to delete resource" });
        }
    });

    return router;
};

module.exports = { createAdminRoutes };
