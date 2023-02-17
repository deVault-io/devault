const express = require("express");
const router = express.Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const Favs = require("../models/Favs.model");
const Votes = require("../models/Votes.model");
const Reviews = require("../models/Reviews.model");
const fileUploader = require("../config/cloudinary.config");
const {
  flattenMap,
  sortRelatedItems,
  filterSearchItems,
  calculateTime,
  getPropertyArray,
} = require("../utils");

// @desc    Tool new rout form
// @route   GET /tools/new
// @access  Private
router.get("/tools/new", isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render("newTool", { user });
});

// @desc    Tool new rout form
// @route   GET /tools/new
// @access  Private
router.get("/tools/myTools", isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const tools = await Tool.find({ user: { $eq: user } });
    res.render("myTools", { user, tools });
  } catch (error) {
    next(error);
  }
});

// @desc    View for all categories and advanced search tool
// @route   GET /tools/discover
// @access  Public
router.get("/tools/discover", async function (req, res, next) {
  try {
    const user = req.session.currentUser;
    const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
    const tag = [...new Set(flattenMap(tools, (tool) => tool.tag))];
    const field = [...new Set(flattenMap(tools, (tool) => tool.field))];
    res.render("toolDiscover", { user, field, tag, tools });
  } catch (error) {
    next(error);
  }
});

// @desc    Tool detail view
// @route   GET /tools:toolId
// @access  Public
router.get("/tools/:toolId", async function (req, res, next) {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  let userReviews = [];
  try {
    const tool = await Tool.findById(toolId).populate("user");
    const reviews = await Reviews.find({ tool: toolId }).populate("user");
    if (user) {
      userReviews = await Reviews.find({ tool: toolId, user: user._id });
    }
    const votes = await Votes.find({ tool: toolId });
    //aggregate that returns related items to the detail view
    const otherTools = await Tool.aggregate([
      {
        $match: {
          field: tool.field,
          _id: { $ne: tool._id },
        },
      },
      {
        $lookup: {
          from: "favs",
          localField: "_id",
          foreignField: "tool",
          as: "favs",
        },
      },
      {
        $addFields: {
          favCount: { $size: "$favs" },
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "tool",
          as: "votes",
        },
      },
      {
        $addFields: {
          avgRating: { $ifNull: [{ $avg: "$votes.rating" }, 0] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
    ]);

    // sends the toolcreator vote to handlebars
    let userVote = null;
    if (user) {
      voteInDb = await votes.find(
        (vote) => vote.user.toString() === user._id.toString()
      );
      if (voteInDb) {
        userVote = voteInDb.rating;
      }
    }
    //adds avgratings and createdago to the related tools or othertools
    otherTools.forEach((tool) => {
      console.log(tool.avgRating);
      tool.createdAgo = calculateTime(tool.createdAt);
      if (typeof tool.avgRating === "number" && tool.avgRating > 0) {
        tool.avgRating = tool.avgRating.toFixed(1);
      } else {
        delete tool.avgRating;
      }
    });
    const items = sortRelatedItems(tool, otherTools);

    //sends createdago,rating associated to the commentor and ownership info to the reviews
    const reviewsWithOwnershipInfo = reviews.map((review) => {
      const reviewObj = review.toObject();
  reviewObj.createdAgo = calculateTime(review.createdAt);
  reviewObj.isCurrentUserReviewer = user && (review.user._id.toString() === user._id);
  const userVote = votes.find(
    (vote) => vote.user.toString() === review.user._id.toString()
  );
  if (userVote) {
    reviewObj.userRating = userVote.rating;
  } else {
    reviewObj.userRating = null;
  }
      console.log(reviewObj);
      return reviewObj;
    });

    // data for the toolID to be printed: avg rating and createdago time
    const sumRatings = votes
      .reduce((sum, votes) => sum + votes.rating, 0)
      .toFixed(1);
    const avgRating =
      votes.length > 0 ? Math.round((sumRatings / votes.length) * 10) / 10 : 0;
    const createdAgo = calculateTime(tool.createdAt);
    const toolTags = getPropertyArray(tool, "tag");
    console.log(toolTags);

    if (user == undefined) {
      res.render("newToolDetail", {
        toolTags,
        userVote,
        user,
        tool,
        items,
        votes,
        reviews:reviewsWithOwnershipInfo,
        avgRating,
        createdAgo,
      });
    } else {
      const isLoggedInUserCreator =
        tool.user._id.toString() == user._id ? true : false;
      res.render("newToolDetail", {
        userVote,
        toolTags,
        user,
        tool,
        items,
        reviews: reviewsWithOwnershipInfo,
        avgRating,
        createdAgo,
        isLoggedInUserCreator,
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Creates a new tool
// @route   POST /tools/new
// @access  Private
router.post(
  "/tools/new",
  isLoggedIn,
  fileUploader.single("imageFile"),
  async function (req, res, next) {
    const user = req.session.currentUser;
    const { name, description, image, url, field, tag } = req.body;
    try {
      const createdTool = await Tool.create({
        name,
        description,
        image,
        imageFile: req.file.path,
        url,
        field,
        tag,
        user: user,
      });
      res.redirect(`/tools/${createdTool._id}`);
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Edit one tool view
// @route   GET /tools/:toolId/edit
// @access  Private
router.get("/tools/:toolId/edit", isLoggedIn, async function (req, res, next) {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  try {
    const tool = await Tool.findById(toolId).populate("user");
    res.render("toolEdit", { user, tool });
  } catch (error) {
    next(error);
  }
});

// @desc    Edit one tool form
// @route   POST /tools/:toolId/edit
// @access  Private
router.post("/tools/:toolId/edit", isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const { name, description, image, url, field, tag } = req.body;
  try {
    const tool = await Tool.findById(toolId).populate("user");
    const editedTool = await Tool.findByIdAndUpdate(
      toolId,
      { name, description, image, url, field, tag, user: user },
      { new: true }
    );
    res.redirect(`/tools/${editedTool._id}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete one tool
// @route   GET /tools/:toolId/delete
// @access  Private
router.get("/tools/:toolId/delete", isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  try {
    await Favs.deleteMany({ tool: toolId });
    await Reviews.deleteMany({ tool: toolId });
    await Votes.deleteMany({ tool: toolId });
    await Tool.deleteOne({ _id: toolId });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// @desc    Takes the inputs from the search form
// @route   POST /tools/finesearch
// @access  Public
router.post("/tools/finesearch", async function (req, res, next) {
  const {
    search: textToSearch,
    search: nameToSearch,
    field: fieldToSearch,
    tag: tagToSearch,
    time: timeToSearch,
    rating: rating,
  } = req.body;
  const user = req.session.currentUser;
  const filter = filterSearchItems(
    textToSearch,
    nameToSearch,
    fieldToSearch,
    tagToSearch,
    timeToSearch,
    rating
  );
  const toolsToTag = await Tool.find({})
    .sort({ createdAt: -1 })
    .populate("user");
  const tag = [...new Set(flattenMap(toolsToTag, (tool) => tool.tag))];
  const field = [...new Set(flattenMap(toolsToTag, (tool) => tool.field))];
  if (filter.length > 0) {
    const sortField = rating ? "avgRating" : "createdAt";
    try {
      const tools = await Tool.aggregate([
        {
          $match: {
            $or: filter,
          },
        },
        {
          $lookup: {
            from: "favs",
            localField: "_id",
            foreignField: "tool",
            as: "favs",
          },
        },
        {
          $addFields: {
            favCount: { $size: "$favs" },
          },
        },
        {
          $lookup: {
            from: "votes",
            localField: "_id",
            foreignField: "tool",
            as: "votes",
          },
        },
        {
          $addFields: {
            avgRating: { $avg: "$votes.rating" },
          },
        },
        {
          $sort: { [sortField]: -1 },
        },
      ]);
      const populatedTools = await Tool.populate(tools, { path: "user" });
      populatedTools.forEach((tool) => {
        tool.createdAgo = calculateTime(tool.createdAt);
        if (typeof tool.avgRating === "number" && tool.avgRating > 0) {
          tool.avgRating = tool.avgRating.toFixed(1);
        } else {
          tool.avgRating = null;
        }
      });
      res.render("toolSearchResults", {
        user,
        tools: populatedTools,
        field,
        tag,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});

// @desc    Takes the inputs from params
// @route   POST /tools/search
// @access  Public

router.get(
  "/tools/tools/search/:itemToSearch",
  async function (req, res, next) {
    const fieldToSearch = req.params.itemToSearch;
    const user = req.session.currentUser;
    const filter = [{ field: fieldToSearch }, { tag: fieldToSearch }];
    const toolsToTag = await Tool.find({})
      .sort({ createdAt: -1 })
      .populate("user");
    const tag = [...new Set(flattenMap(toolsToTag, (tool) => tool.tag))];
    const field = [...new Set(flattenMap(toolsToTag, (tool) => tool.field))];
    if (filter.length > 0) {
      try {
        const tools = await Tool.aggregate([
          {
            $match: {
              $or: filter,
            },
          },
          {
            $lookup: {
              from: "favs",
              localField: "_id",
              foreignField: "tool",
              as: "favs",
            },
          },
          {
            $addFields: {
              favCount: { $size: "$favs" },
            },
          },
          {
            $lookup: {
              from: "votes",
              localField: "_id",
              foreignField: "tool",
              as: "votes",
            },
          },
          {
            $addFields: {
              avgRating: { $ifNull: [{ $avg: "$votes.rating" }, 0] },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        const populatedTools = await Tool.populate(tools, { path: "user" });
        populatedTools.forEach((tool) => {
          tool.createdAgo = calculateTime(tool.createdAt);
          if (typeof tool.avgRating === "number" && tool.avgRating > 0) {
            tool.avgRating = tool.avgRating.toFixed(1);
          } else {
            tool.avgRating = null;
          }
        });
        res.render("toolSearchResults", {
          user,
          tools: populatedTools,
          field,
          tag,
        });
      } catch (error) {
        console.error(error);
        next(error);
      }
    }
  }
);

// @desc    Edit one list form
// @route   POST /lists/:listId/edit
// @access  Private
router.post("/tools/:toolId/vote", isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const { rating, secondRating } = req.body;
  try {
    if(rating){
    const tool = await Tool.findById(toolId).populate("user");
    let votedTool = await Votes.findOneAndUpdate(
      { tool: toolId, user: user._id },
      { rating },
      { upsert: true, new: true }
    );
    } else{
      let rating = secondRating
      const tool = await Tool.findById(toolId).populate("user");
    let votedTool = await Votes.findOneAndUpdate(
      { tool: toolId, user: user._id },
      { rating },
      { upsert: true, new: true });
    }
    res.redirect(`/tools/${toolId}`);
  } catch (error) {
    next(error);
  }
});

/* POST new review */
/* ROUTE /tools/:toolId/review */
// @access  Private

router.post(
  "/tools/:toolId/review",
  isLoggedIn,
  async function (req, res, next) {
    const { review } = req.body;
    const user = req.session.currentUser;
    const { toolId } = req.params;
    try {
      await Reviews.create({ review, user: user._id, tool: toolId });
      res.redirect(`/tools/${toolId}`);
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Edit one review
// @route   GET /tools/:toolId/:reviewId/edit
// @access  Private
router.get(
  "/tools/:toolId/:reviewId/edit",
  isLoggedIn,
  async function (req, res, next) {
    const { toolId, reviewId } = req.params;
    const user = req.session.currentUser;
    try {
      const review = await Reviews.findById(reviewId).populate("user");
      res.render("reviews/reviewEdit", { user, review });
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Edit one review form
// @route   POST /tools/:toolId/:reviewId/edit
// @access  Private
router.post(
  "/tools/:toolId/:reviewId/edit",
  isLoggedIn,
  async (req, res, next) => {
    const { toolId, reviewId } = req.params;
    const user = req.session.currentUser;
    const { review } = req.body;

    try {
      await Reviews.findByIdAndUpdate(
        reviewId,
        { review, user: user },
        { new: true }
      );
      res.redirect(`/tools/${toolId}`);
    } catch (error) {
      next(error);
    }
  }
);

// @desc    Delete one review
// @route   GET /tools/:toolId/:reviewId/delete
// @access  Private
router.get(
  "/tools/:toolId/:reviewId/delete",
  isLoggedIn,
  async (req, res, next) => {
    const { toolId, reviewId } = req.params;
    try {
      await Reviews.deleteOne({ _id: reviewId });
      res.redirect(`/tools/${toolId}`);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
