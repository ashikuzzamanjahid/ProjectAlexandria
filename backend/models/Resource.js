const mongoose = require("mongoose");

// Define schema for resources
const resourceSchema = new mongoose.Schema({
    courseid: { type: String, required: true }, // Reference to the course ID
    topic: { type: String, required: true }, // Name of the topic
    links: { type: [String], default: [] }, // Array of resource links
});

// Export the Resource model
module.exports = mongoose.model("Resource", resourceSchema);
