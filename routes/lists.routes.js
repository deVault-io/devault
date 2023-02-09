const express = require('express');
const router = express.Router();
const Tool = require("../models/Tool.model");
const Favs = require("../models/Favs.model");
const Lists = require("../models/Lists.model");
const isLoggedIn = require('../middlewares');

// @desc    lists of favorites view
// @route   GET /
// @access  Private
router.get('/', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  try {
    const lists = await Lists.find({user: { $eq: user }}).populate('user');
    res.render('lists/favsList', {user, lists});
  } catch (error) {
    next(error)
  }
});

// @desc    new list view
// @route   GET /new
// @access  Private
router.get('/new', isLoggedIn, function (req, res, next) {
  res.render('lists/favsListNew');
});

// @desc    creates a new list
// @route   POST /new
// @access  Private
router.post('/new', isLoggedIn, async function (req, res, next) {
  const user = req.session.currentUser;
  const { listName, image } = req.body;
  try {
    const createdList = await Lists.create({ default: false, listName, image: 'https://i.imgur.com/ExgDzpE.png', user });
    res.redirect(`/lists/${createdList._id}`);
  } catch (error) {
    next(error)
  }
});

// @desc    Gets ONE list
// @route   GET /:listId
// @access  Private
router.get('/:listId', async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  const list = await Lists.findById(listId);
  const tools = await Tool.find({}).populate('user');
  const favs = await Favs.find({list: { $eq: listId }}).populate('tool').populate('user').populate('list');
  try {
    res.render('lists/favsListDetail', { user, tools, list, favs });
  } catch (error) {
    next(error)
  }
});

// @desc    tool select list to add
// @route   GET /tools/:toolId/fav
// @access  Private
router.get('/:toolId/fav', isLoggedIn, async (req, res, next) => {
  const { toolId } = req.params;
  const user = req.session.currentUser;
  const tool = await Tool.findById(toolId).populate('user');
  const list = await Lists.find({user: user});
  console.log(list)
  try {
    const lists = await Lists.find({user: { $eq: user }});
    res.render('lists/selectList', {user, lists});
  } catch (error) {
    next(error)
  }
});

// @desc    one tool fav
// @route   GET /tools/:toolId/fav
// @access  Private
router.get('/:toolId/:listId/add', isLoggedIn, async (req, res, next) => {
  const { toolId, listId } = req.params;
  const user = req.session.currentUser;
  const tool = await Tool.findById(toolId).populate('user');
  const selectedList = await Lists.findById(listId);
  const favExists = await Favs.findOne({tool: tool._id, list: selectedList._id, user: user._id});
  try { if (!favExists) {
    const newFav = await Favs.create({ tool: tool._id, user: user._id, list: selectedList._id });
    res.redirect(`/lists/${selectedList._id}`);
    return newFav; 
    } else {
      throw new Error(`${tool.name} already added to ${selectedList.listName}`)
    }
  } catch (error) {
    next(error)
  }
});

// @desc    Tools to add to list
// @route   GET /:listId/add
// @access  Private
router.get('/:listId/add', async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  try {
    const list = await Lists.findById(listId).populate("user");
    res.render("lists/favsSearch", { user, list });
  } catch (error) {
    next(error)
  }
});

// @desc    Takes the inputs from the search form
// @route   POST /tools/finesearch
// @access  Public
router.post("/:listId/search", async function (req, res, next) {
  const { listId } = req.params;
  const {
    search: textToSearch,
    search: nameToSearch,
    field: fieldToSearch,
    tag: tagToSearch,
    time: timeToSearch
  } = req.body;
  const user = req.session.currentUser;
  const list = Lists.findById(listId).populate("user");
  filter = [];
  if (textToSearch) {
    const words = textToSearch
      .toLowerCase()
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const wordVariants = words
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
        word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),])
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
        word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),])
      .flat();
    const textRegex = wordVariants.map((word) => ({
      name: { $regex: word, $options: "i" },
    }));
    filter.push({ $or: textRegex });
  }
  if (fieldToSearch) {
    filter.push({ field: fieldToSearch });
  }
  if (timeToSearch) {
    let currentDate = new Date();
    let range = { $gte: new Date(0) };
    switch (timeToSearch) {
      case "today":
        range = { $gte: currentDate };
        break;
      case "last-week":
        range = { $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)) };
        break;
      case "last-month":
        range = { $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)) };
        break;
      case "last-sixth-months":
        range = { $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 6)) };
        break;
    }
    filter.push({ dateCreated: range });
  }
  if (typeof tagToSearch == `object`) {
    const stringFromObject = JSON.stringify(tagToSearch);
    const tagWords = stringFromObject
      .split(" ")
      .filter((word) => !exclude.includes(word));
    const tagRegex = new RegExp(tagWords.join("|"), "i");
    filter.push({ tag: { $regex: tagRegex } });
  } else if (typeof tagToSearch == `string`) {
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
      res.render("favsSearchResults", { user, items, list });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});

// @desc    Edit one list view
// @route   GET /lists/:listId/edit
// @access  Private
router.get("/:listId/edit", async function (req, res, next) {
  const { listId } = req.params;
  const user = req.session.currentUser;
  try {
    const list = await Lists.findById(listId).populate("user");
    res.render("lists/favsListEdit", { user, list });
  } catch (error) {
    next(error);
  }
});

// @desc    Edit one list form
// @route   POST /lists/:listId/edit
// @access  Private
router.post("/:listId/edit", isLoggedIn, async (req, res, next) => {
  const { listId } = req.params;
  console.log(listId)
  const user = req.session.currentUser;
  const { listName, image  } = req.body;
  try {
    const list = await Lists.findById(listId).populate("user");
    const editedList = await Lists.findByIdAndUpdate(listId, { listName, image, user: user }, { new: true });
    console.log(editedList)
    res.redirect(`/lists/${editedList._id}`);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete one list
// @route   GET /lists/:listId/delete
// @access  Private
router.get("/:listId/delete", isLoggedIn, async (req, res, next) => {
  const { listId } = req.params;
  try {
    await Favs.deleteMany({});
    await Lists.deleteOne({ _id: listId });
    res.redirect("/lists");
  } catch (error) {
    next(error);
  }
});

module.exports = router;