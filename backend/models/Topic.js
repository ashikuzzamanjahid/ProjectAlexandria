const mongoose = require("mongoose");

// Define schema for topics
const topicSchema = new mongoose.Schema({
    courseid: { type: String, required: true, unique: true }, // Reference to the course ID
    topics: { type: [String], default: [] }, // Array of topic names
});

// Export the Topic model
module.exports = mongoose.model("Topic", topicSchema);
