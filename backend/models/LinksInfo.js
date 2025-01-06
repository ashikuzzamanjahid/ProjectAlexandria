const mongoose = require("mongoose");

// Define schema for links info
const linksInfoSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

// Export the LinksInfo model
module.exports = mongoose.model("LinksInfo", linksInfoSchema);
