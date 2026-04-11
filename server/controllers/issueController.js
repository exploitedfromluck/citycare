const Issue = require("../models/Issue");
const mongoose = require("mongoose");

// CREATE ISSUE
const createIssue = async (req, res, next) => {
  try {
    const { title, description, category, location, image } = req.body;

    if (!location || location.lat == null || location.lng == null) {
      return res.status(400).json({ message: "Location is required" });
    }

    const issue = new Issue({
      title,
      description,
      category,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        address: location.address || "",
      },
      image: image || "",
      reportedBy: req.user ? req.user._id : "anonymous",
    });

    const created = await issue.save();
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// GET ALL ISSUES
const getIssues = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    let filter = {};

    if (category && category !== "all") filter.category = category;
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const issues = await Issue.find(filter).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

// GET ISSUE BY ID
const getIssueById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

// UPDATE ISSUE
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

// DELETE ISSUE
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ message: "Issue deleted" });
  } catch (err) {
    next(err);
  }
};

// NEARBY ISSUES
const getNearbyIssues = async (req, res, next) => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat & lng required" });
    }

    let query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius) || 2000,
        },
      },
    };

    if (category) {
      query.category = category;
    }

    const issues = await Issue.find(query);
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

// GET STATS
const getStats = async (req, res, next) => {
  try {
    const total = await Issue.countDocuments();
    const resolved = await Issue.countDocuments({ status: "resolved" });
    const inProgress = await Issue.countDocuments({ status: "in-progress" });
    const reported = await Issue.countDocuments({ status: "reported" });

    const byCategory = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentIssues = await Issue.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category status createdAt");

    res.json({
      total,
      resolved,
      inProgress,
      reported,
      byCategory,
      byStatus,
      recentIssues,
    });
  } catch (err) {
    next(err);
  }
};

// UPVOTE ISSUE
const upvoteIssue = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id.toString() : req.ip;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.upvotedBy.includes(userId)) {
      return res.status(400).json({ message: "Already upvoted" });
    }

    issue.upvotes += 1;
    issue.upvotedBy.push(userId);
    await issue.save();

    res.json(issue);
  } catch (err) {
    next(err);
  }
};

// ADD COMMENT
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userName = req.user ? req.user.name : "Anonymous";

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.comments.push({ user: userName, text });
    await issue.save();

    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
};

// GET USER'S ISSUES
const getUserIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(issues);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};