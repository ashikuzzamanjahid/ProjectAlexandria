const mongoose = require("mongoose");

// Define schema for resources
const resourceSchema = new mongoose.Schema({
    courseid: { type: String, required: true },
    topic: { type: String, required: true },
    links: { type: [String], required: true }
});

// Export the Resource model
module.exports = mongoose.model("Resource", resourceSchema);
