const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getNearbyIssues,
  getStats,
  upvoteIssue,
  addComment,
  getUserIssues,
} = require("../controllers/issueController");

// Public routes
router.get("/", getIssues);
router.get("/stats", getStats);
router.get("/nearby", getNearbyIssues);
router.get("/my", protect, getUserIssues);
router.get("/:id", getIssueById);

// Authenticated routes
router.post("/", protect, createIssue);
router.post("/:id/upvote", protect, upvoteIssue);
router.post("/:id/comments", protect, addComment);

// Admin routes
router.put("/:id", protect, adminOnly, updateIssue);
router.delete("/:id", protect, adminOnly, deleteIssue);

module.exports = router;