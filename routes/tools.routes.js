const express = require("express");
const router = express.Router();
const Tool = require("../models/Tool.model");
const isLoggedIn = require("../middlewares");
const exclude = require("../data/exclude");
const Favs = require("../models/Favs.model");
const fileUploader = require("../config/cloudinary.config");

/* GET form view */
/* ROUTE /Tools/new 
USER PROTECTED ROUTE*/
router.get("/tools/new", isLoggedIn, function (req, res, next) {
  const user = req.session.currentUser;
  res.render("newTool", { user });
});

// VIEW FOR ALL CATEGORIES AND ADVANCED SEARCH TOOL
/* ROUTE /tools/discover */
// PUBLIC ROUTE
function flatMap(array, mapper) {
  return [].concat(...array.map(mapper));
}
router.get("/tools/discover", async function (req, res, next) {
  try {
    const user = req.session.currentUser;
    const tools = await Tool.find({}).sort({ createdAt: -1 }).populate("user");
    console.log(`tools debugging ${tools}`);
    const tag = [...new Set(flatMap(tools, (tool) => tool.tag))];
    const field = [...new Set(flatMap(tools, (tool) => tool.field))];
    res.render("toolDiscover", { user, field, tag, tools });
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
    /* const isLoggedInUserCreator =
      tool.user._id.toString() == user._id ? true : false; */
    /* const otherTools = await Tool.find({
      field: tool.field,
      _id: { $ne: tool._id },
    }); */
    /* const descriptionVariant = tool.description
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
        const similarity = descriptionWords.filter((word) =>
          descriptionVariant.includes(word)
        ).length;
        return { ...t, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .splice(0, 3)
      .map(({ similarity, ...t }) => t); */
    console.log(items);
    res.render("newToolDetail", { user, tool, items: items/* , isLoggedInUserCreator */ });
  } catch (error) {
    next(error);
  }
});

/* POST GET USERS NEW TOOL */
/* ROUTE /Tools/new */
//PROTECTED ROUTE
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

//ROUTE that allow user to edit
/* ROUTE tools/:toolId/edit */
//PROTECTED ROUTE
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
//PROTECTED ROUTE
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

/* GET advanced search */
/* ROUTE tools/finesearche */
//PUBLIC ROUTE
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
    console.log("i get here");
    const stringFromObject = JSON.stringify(tagToSearch);
    console.log(`string from object ${stringFromObject}`);
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
