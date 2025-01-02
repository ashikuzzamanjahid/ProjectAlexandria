const mongoose = require("mongoose");

// Define schema for courses
const courseSchema = new mongoose.Schema({
    courseid: { type: String, required: true, unique: true }, // Unique identifier for the course
    coursename: { type: String, required: true }, // Name of the course
    numberOfTopics: { type: Number, default: 0 }, // Number of topics in the course
});

// Export the Course model
module.exports = mongoose.model("Course", courseSchema);
