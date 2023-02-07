const express = require("express");
const router = express.Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude = require("../data/exclude");
const Favs = require("../models/Favs.model");
const fileUploader = require("../config/cloudinary.config");

// @desc    Tool new rout form
// @route   GET /tools/new
// @access  Private
router.get("/tools/new", isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render("newTool", { user });
});

// @desc    View for all categories and advanced search tool
// @route   GET /tools/discover
// @access  Public
function flatMap(array, mapper) {
  return [].concat(...array.map(mapper));
}
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

// @desc    Tool detail view
// @route   GET /tools:toolId
// @access  Public
router.get("/tools/:toolId", async function (req, res, next) {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  let items = [];
  try {
    const tool = await Tool.findById(toolId).populate('user');
    // const isLoggedInUserCreator =
    //   tool.user._id.toString() == user._id ? true : false;
    const otherTools = await Tool.find({
      field: tool.field,
      _id: { $ne: tool._id },
    });
    //Takes the tool description and split it, take the single words, exclude the 
    //excluded words from data and generate word variations for each one, then flat it()
    const descriptionVariant = tool.description
      .toLowerCase()
      .split(" ")
      .filter((word) => !exclude.includes(word))
      .map((word) => [
        word,
        word + "s",
        word.slice(0, -1),
        word + "ing",
        word + "ed",
        word + "ly",
        word.replace(/y$/, "ies"),
        word.replace(/([aeiou])([^aeiou]+)$/, "$1$2s"),
        word.replace(/([aeiou])([^aeiou]+)([sxzh])$/, "$1$2$3es"),
        word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),
      ])
      .flat();
      //takes the tools related by field, split the words, exclude the excluded words
      //add variations for each one then flat it
    items = otherTools
      .map((t) => {
        const descriptionWords = t.description.split(" ").filter((word) => !exclude.includes(word))
        .map((word) => [
          word,
          word + "s",
          word.slice(0, -1),
          word + "ing",
          word + "ed",
          word + "ly",
          word.replace(/y$/, "ies"),
          word.replace(/([aeiou])([^aeiou]+)$/, "$1$2s"),
          word.replace(/([aeiou])([^aeiou]+)([sxzh])$/, "$1$2$3es"),
          word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),
        ])
        .flat();;
        //find similarity, which is the amout of matches of the tool description and
        //the word variantes from the other tools, the return that similarity(number)
        //embeded in the object properties.  Then sort them by similarity and for each 
        // tool send to view the _doc property that includes the tool properties
        const similarity = descriptionWords.filter((word) =>
          descriptionVariant.includes(word)
        ).length;
        return { ...t, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .splice(0, 3)
      .map(item => item._doc);
    res.render("newToolDetail", { user, tool,items });
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

// @desc    Takes the inputs from the search form
// @route   POST /tools/finesearch
// @access  Public
router.post("/tools/finesearch", async function (req, res, next) {
  const {
    search: textToSearch,
    search: nameToSearch,
    field: fieldToSearch,
    tag: tagToSearch,
  } = req.body;
  const user = req.session.currentUser;
  const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
  filter = [];
  if (textToSearch) {
    const words = textToSearch
      .toLowerCase()
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const wordVariants = words
      .map((word) => [word, word + "s", word.slice(0, -1)])
      .flat();
    const textRegex = wordVariants.map((word) => ({
      description: { $regex: word, $options: "i" },
    }));
    filter.push({ $or: textRegex });
  }
  if (nameToSearch) {
    const words = nameToSearch
      .toLowerCase()
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const wordVariants = words
      .map((word) => [word, word + "s", word.slice(0, -1)])
      .flat();
    const textRegex = wordVariants.map((word) => ({
      name: { $regex: word, $options: "i" },
    }));
    filter.push({ $or: textRegex });
  }
  if (fieldToSearch) {
    filter.push({ field: fieldToSearch });
  }
  if (typeof tagToSearch == `object` && tagToSearch === "string") {
    const stringFromObject = JSON.stringify(tagToSearch);
    const tagWords = stringFromObject
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const tagRegex = new RegExp(tagWords.join("|"), "i");
    filter.push({ tag: { $regex: tagRegex } });
  } else if (typeof tagToSearch == `string` && tagToSearch === "string") {
    const tagWords = tagToSearch
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const tagRegex = new RegExp(tagWords.join("|"), "i");
    filter.push({ tag: { $regex: tagRegex } });
  }
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
