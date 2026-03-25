const mongoose = require("mongoose");

const SECTION_ENUM = ["slides", "notes", "videos", "resources", "additional"];
const STATUS_ENUM = ["open", "resolved", "dismissed"];

const resourceReportSchema = new mongoose.Schema({
    courseid: { type: String, required: true },
    topic: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, required: true, default: "resources" },
    url: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: STATUS_ENUM, default: "open" },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handledAt: { type: Date },
}, { timestamps: true });

resourceReportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ResourceReport", resourceReportSchema);
