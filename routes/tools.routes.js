const express = require("express");
const router = express.Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude = require("../data/exclude");
const Favs = require("../models/Favs.model");
const fileUploader = require("../config/cloudinary.config");
const {flattenMap,sortRelatedItems,filterSearchItems} = require("../utils");


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
    const tools = await Tool.find({user: { $eq: user }});
    console.log(tools)
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
    console.log(toolId) //I dont underestand why tool is not  picked.
    console.log(tool)
    const isLoggedInUserCreator = tool.user._id.toString() == user._id ? true : false;
    const otherTools = await Tool.find({
      field: tool.field,
      _id: { $ne: tool._id },
    });
    const items = sortRelatedItems(tool,otherTools);
    res.render("newToolDetail", { user, tool, items, isLoggedInUserCreator});
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
router.get("/tools/:toolId/edit", async function (req, res, next) {
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
router.post("/tools/:toolId/edit", async (req, res, next) => {
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
router.get("/tools/:toolId/delete", async (req, res, next) => {
  const { toolId } = req.params;
  try {
    await Favs.deleteMany({ tool: toolId });
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
  } = req.body;
  const user = req.session.currentUser;
  const filter = filterSearchItems(textToSearch,nameToSearch,fieldToSearch,tagToSearch,timeToSearch)
  if (filter.length > 0) {
    try {
      const items = await Tool.aggregate([
        {
          $match: {
            $or: filter,
          },
        },
      ]);
      res.render("toolSearchResults", { user, items });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});
module.exports = router;
