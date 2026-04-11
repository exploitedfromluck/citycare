const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["garbage", "pothole", "streetlight", "water", "other"],
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },

    status: {
      type: String,
      enum: ["reported", "in-progress", "resolved"],
      default: "reported",
    },

    priority: {
      type: Number,
      default: 1,
    },

    image: String,

    reportedBy: {
      type: mongoose.Schema.Types.Mixed,
      default: "anonymous",
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    upvotedBy: [String],

    comments: [commentSchema],
  },
  { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);