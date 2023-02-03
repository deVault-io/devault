const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude= require('../data/exclude');
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");

/* GET form view */
/* ROUTE /Tools/new 
USER PROTECTED ROUTE*/
router.get("/tools/new", isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render("newTool", { user });
});

/* POST  GET USERS NEW TOOL */
/* ROUTE /Tools/new */
router.post("/tools/new", isLoggedIn, async function (req, res, next) {
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
  // _id: { $ne: tool._id }
  const { toolId } = req.params;
  const tool = await Tool.findById(toolId).populate("user");
  const user = req.session.currentUser;
  console.log(tool);
  let items = [];
  try {
    const count = await Tool.count({ field: `${tool.field}` });
    if (count <= 3) {
      items = await Tool.aggregate([{ $sample: { size: 3 } }]);
    } else if (count > 3) {
      const itemsToRandom = await Tool.find({
        field: `${tool.field}`,
        _id: { $ne: tool._id },
      });
      items = itemsToRandom.sort(() => 0.5 - Math.random()).slice(0, 3);
    }  if (req.session.currentUser) {
      const isLoggedInUserCreator = tool.user._id.toString() == user._id ? true : false;
      res.render("toolDetail", {
        user,
        tool,
        items: items,
        isLoggedInUserCreator,
      });
    } else {
      res.render("toolDetail", {
        user,
        tool,
        items: items,
      });
    }
  } catch (error) {
    next(error);
  }
});
// TOOL RETURNS RANDOM TOOL BASED ON NUMBER OF MATCHES IN SEARCH
const randomTool = async function (){
  try {
  const tool = await Tool.findById(toolId).populate('user');
  const count = await Tool.count({field:`${tool.field}`});
  if (count <= 3){
    const items = await Tool.aggregate([{$sample: {size: 3}}]);
    res.render('toolDetail', { user, tool, items:items });
    return items
  } else{
    const itemsToRandom = await Tool.find({field: `${tool.field}`, _id: { $ne: tool._id }});
    const items = itemsToRandom.sort(()=> 0.5- Math.random()).slice(0,3);
    res.render('toolDetail', { user, tool, items: items });
    return items;
  }
} catch (error) {
  next(error);
}
}

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
    await Tool.findByIdAndRemove(toolId);
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

/* GET one tool edit */
/* ROUTE /tools/:toolId/edit */
router.post("/tools/search", async function (req, res, next) {
  const user = req.session.currentUser;
  const searchTerm = req.body.input;
  const words = searchTerm.split(" ").filter(word => !exclude.includes(word));
  const regex = new RegExp(words.join("|"), "i");
  const items = await Tool.aggregate(
    [
    {
        $match: {
            $or: [{ description: { $regex: regex } }
            ]
        }
    }
], function(err, result) {
  
});
res.render("toolSearchResults", { user, items });
});

module.exports = router;
