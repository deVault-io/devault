const express = require("express");
const router = express.Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude = require("../data/exclude");
const Favs = require("../models/Favs.model");
const Votes = require("../models/Votes.model");
const Reviews = require("../models/Reviews.model");
const fileUploader = require("../config/cloudinary.config");
const { flattenMap, sortRelatedItems, filterSearchItems, calculateTime } = require("../utils");

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
  try {
    const tool = await Tool.findById(toolId).populate("user");
    const reviews = await Reviews.find({ tool: toolId }).populate("user");
    const votes = await Votes.find({ tool: toolId });
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
          avgRating: { $ifNull: [{$avg: "$votes.rating"}, 0] },
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
    otherTools.forEach(tool => {
      tool.createdAgo = calculateTime(tool.createdAt);
      if (typeof tool.avgRating === "number" && tool.avgRating > 0) {
        tool.avgRating = tool.avgRating.toFixed(1);
        } else {
          tool.avgRating = null
        }
        });
    const items = sortRelatedItems(tool, otherTools);
    console.log(`items ${items}`)
    const sumRatings = votes.reduce((sum, votes) => sum + votes.rating, 0).toFixed(1);
    const avgRating = votes.length > 0 ? Math.round((sumRatings / votes.length) * 10) / 10 : 0;
    const createdAgo =  calculateTime(tool.createdAt)

    if (user == undefined) {
      res.render("newToolDetail", { user, tool, items, votes });
    } else {
      const isLoggedInUserCreator = tool.user._id.toString() == user._id ? true : false;
      res.render("newToolDetail", { user, tool, items, reviews, avgRating,createdAgo, isLoggedInUserCreator });
    }
  }  catch (error) {
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
    rating: rating
  } = req.body;
  const user = req.session.currentUser;
  const filter = filterSearchItems(
    textToSearch,
    nameToSearch,
    fieldToSearch,
    tagToSearch,
    timeToSearch,rating
  );
  const toolsToTag = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
  const tag = [...new Set(flattenMap(toolsToTag, (tool) => tool.tag))];
  const field = [...new Set(flattenMap(toolsToTag, (tool) => tool.field))];
  if (filter.length > 0) {
    const sortField = rating ? 'avgRating' : 'createdAt';
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
    populatedTools.forEach(tool => {
      tool.createdAgo = calculateTime(tool.createdAt);
    });
    console.log(populatedTools)
      res.render("toolSearchResults", { user, tools:populatedTools,field,tag });
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
    const toolsToTag = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
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
            $sort: { createdAt: -1 },
          },
        ]);
        const populatedTools = await Tool.populate(tools, { path: "user" });
      populatedTools.forEach(tool => {
        tool.createdAgo = calculateTime(tool.createdAt);
      });
        res.render("toolSearchResults", { user, tools:populatedTools ,field,tag});
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
  console.log(user)
  const { rating } = req.body;
  try {
    const tool = await Tool.findById(toolId).populate('user');
    let votedTool = await Votes.findOneAndUpdate(
      { tool: toolId, user: user._id },
      { rating },
      { upsert: true, new: true }
    );
    console.log(votedTool)
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

/* POST new review */
/* ROUTE /tools/:toolId/review */
// @access  Private

router.post('/tools/:toolId/review', isLoggedIn, async function (req, res, next) {
  const { review } = req.body;
  const user = req.session.currentUser;
  const { toolId } = req.params;
  try {
    await Reviews.create({ review, user: user._id, tool: toolId });
    res.redirect(`/tools/${toolId}`)
  } catch (error) {
    next(error)
  }
});

module.exports = router;