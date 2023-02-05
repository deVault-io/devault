const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude = require("../data/exclude");
const flatMap = require('../utils')
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const fileUploader = require('../config/cloudinary.config');
const { text } = require("express");

/* GET form view */
/* ROUTE /Tools/new 
USER PROTECTED ROUTE*/
router.get("/tools/new", isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render("newTool", { user });
});

/* ROUTE /tools/discover */
// PUBLIC ROUTE
router.get("/tools/discover", async function (req, res, next) {
  try {
    const user = req.session.currentUser;
    const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
    const tag = [...new Set(flatMap(tools, (tool) => tool.tag))];
    const field = [...new Set(flatMap(tools, (tool) => tool.field))];
    res.render("toolDiscover", { user, field, tag, tools });
  } catch (error) {
    next(error);
  }
});
/* POST  GET USERS NEW TOOL */
/* ROUTE /Tools/new */
router.post("/tools/new", isLoggedIn, fileUploader.single('imageFile'), async function (req, res, next) {
  const user = req.session.currentUser;
  /* const regexUrl = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  if (!regexUrl.test(imageUrl)) {
    res.render('newTool', { error: 'image needs to be a valid http:// address'});
    return;
  } */
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
});

/* GET one tool */
/* ROUTE /tools/:toolId */
// PUBLIC ROUTE
router.get("/tools/:toolId", async function (req, res, next) {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  let items = [];
  try {
    const tool = await Tool.findById(toolId);
    /* const count = await Tool.count({ field: {$size: tool.field} });
    if (count <= 3) {
      items = await Tool.aggregate([{ $sample: { size: 3 } }]);
    } else if (count > 3) {
      const itemsToRandom = await Tool.find({
        field: `${tool.field}`,
        _id: { $ne: tool._id },
      });
      items = itemsToRandom.sort(() => 0.5 - Math.random()).slice(0, 3);
    }
    if (req.session.currentUser) {
      const isLoggedInUserCreator =
        tool.user._id.toString() == user._id ? true : false;
      res.render("toolDetail", {
        user,
        tool,
        items: items,
        isLoggedInUserCreator,
      });
      console.log(count)
    } else { */
      res.render("newToolDetail", {
        user,
        tool,
        items: items,
      });
  
  } catch (error) {
    next(error);
  }
});

/* GET one tool edit */
/* ROUTE /tools/:toolId/edit */
// PROTECTED VIEW
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

/* POST Tool Update */
/* ROUTE tools/:toolId/edit */
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

/* GET delete Tool */
/* ROUTE tools/:toolId/delete */
router.get("/tools/:toolId/delete", async (req, res, next) => {
  const user = req.session.currentUser;
  const { toolId } = req.params;
  try {
    const tool = await Tool.findById(toolId).populate("user");
    await Favs.deleteMany({ tool: toolId });
    await Tool.deleteOne({ _id: toolId });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

//  SEARCH TEXT INPUT
router.get("/tools/search/:tag", async function (req, res, next) {
  const user = req.session.currentUser;
  const searchTerm = req.body.input;
  const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
  const field = tools.map((tool) => tool.field);
  const words = searchTerm.split(" ").filter((word) => !exclude.includes(word));
  const regex = new RegExp(words.join("|"), "i");
  const items = await Tool.aggregate(
    [
      {
        $match: {
          $or: [{ description: { $regex: regex } }],
        },
      },
    ],
    function (err, result) {}
  );
  res.render("toolSearchResults", { user, items });
});

//  FINE SEARCH
router.post("/tools/finesearch", async function (req, res, next) {
{search: textToSearch, search: nameToSearch, field: fieldToSearch, tag: tagToSearch} = req.body;
  const textToSearch = req.body.search;
  const nameToSearch = req.body.search;
  const fieldToSearch = req.body.field;
  const tagToSearch = req.body.tag;
  console.log(`this is the first tag to search${tagToSearch}`)
  const user = req.session.currentUser;
  const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
  const filter = [];
  function filterSearchItems(textToSearch,tagToSrch,fieldToSearch)
  if (filter.length > 0) {
    try {
        const items = await Tool.aggregate([
          {
            $match: {
              $or: filter
            }
          }
        ]);
        res.render("toolSearchResults", { user, items });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
})
module.exports = router;