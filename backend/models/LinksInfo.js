const mongoose = require("mongoose");

const SECTION_ENUM = ["slides", "notes", "videos", "resources", "additional"];

// Define schema for links info
const linksInfoSchema = new mongoose.Schema({
    courseid: { type: String, required: true, default: "" },
    topic: { type: String, required: true },
    section: { type: String, enum: SECTION_ENUM, default: "resources", required: true },
    url: { type: String, required: true },
    description: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

linksInfoSchema.index({ courseid: 1, topic: 1, section: 1, url: 1 }, { unique: true });

// Export the LinksInfo model
module.exports = mongoose.model("LinksInfo", linksInfoSchema);
