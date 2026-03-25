const mongoose = require("mongoose");

const SECTION_ENUM = ["slides", "notes", "videos", "resources", "additional"];

const resourceVoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseid: { type: String, required: true },
    topic: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, required: true, default: "resources" },
    url: { type: String, required: true },
    value: { type: String, enum: ["like", "dislike"], required: true },
}, { timestamps: true });

resourceVoteSchema.index({ userId: 1, courseid: 1, topic: 1, section: 1, url: 1 }, { unique: true });

module.exports = mongoose.model("ResourceVote", resourceVoteSchema);
