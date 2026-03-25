const mongoose = require("mongoose");

const SECTION_ENUM = ["slides", "notes", "videos", "resources", "additional"];
const STATUS_ENUM = ["pending", "approved", "rejected"];

const resourceSubmissionSchema = new mongoose.Schema({
    courseid: { type: String, required: true },
    topic: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, required: true, default: "resources" },
    url: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: STATUS_ENUM, default: "pending" },
    adminNote: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
}, { timestamps: true });

resourceSubmissionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ResourceSubmission", resourceSubmissionSchema);
