const mongoose = require("mongoose");

const SECTION_ENUM = ["slides", "notes", "videos", "resources", "additional"];

// Define schema for resources
const resourceSchema = new mongoose.Schema({
    courseid: { type: String, required: true },
    topic: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, default: "resources", required: true },
    links: { type: [String], required: true }
});

resourceSchema.index({ courseid: 1, topic: 1, section: 1 }, { unique: true });

// Export the Resource model
module.exports = mongoose.model("Resource", resourceSchema);
