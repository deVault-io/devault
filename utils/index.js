const exclude = require("../data/exclude");

const flattenMap = (array, mapper) => {
  return [].concat(...array.map(mapper));
};

const sortRelatedItems = (tool, otherTools) => {
  let items = [];
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
  return (items = otherTools
    .map((t) => {
      const descriptionWords = t.description
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
    .splice(0, 3));
  // .map(item => item._doc);
};

//function that calculates the time since the tool was created

function calculateTime(date) {
  const now = new Date();
  const elapsedTime = now - date;

  const seconds = Math.floor(elapsedTime / 1000);
  const minutes = Math.floor(elapsedTime / 1000 / 60);
  const hours = Math.floor(elapsedTime / 1000 / 60 / 60);
  const days = Math.floor(elapsedTime / 1000 / 60 / 60 / 24);
  const months = Math.floor(elapsedTime / 1000 / 60 / 60 / 24 / 30);
  const years = Math.floor(elapsedTime / 1000 / 60 / 60 / 24 / 365);

  if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (hours < 24) {
    return `${hours} hours ago`;
  } else if (days < 30) {
    return `${days} days ago`;
  } else if (months < 12) {
    return `${months} months ago`;
  } else {
    return `${years} years ago`;
  }
}

const filterSearchItems = function (
  textToSearch,
  nameToSearch,
  fieldToSearch,
  tagToSearch,
  timeToSearch,
  rating
) {
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
        word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),
      ])
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
        word.replace(/([^aeiou])([aeiou])([^aeiou]+)$/, "$1$2$3s"),
      ])
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
        range = {
          $gte: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            0,
            0,
            0
          ),
        };
        break;
      case "last-week":
        range = {
          $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
        };
        break;
      case "last-month":
        range = {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        };
        break;
      case "last-sixth-months":
        range = {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 6)),
        };
        break;
    }
    filter.push({ createdAt: range });
    console.log(range);
    console.log(timeToSearch);
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
  return filter;
};

function getPropertyArray(obj, propName) {
  if (obj[propName] && Array.isArray(obj[propName])) {
    return obj[propName];
  } else {
    return [];
  }
}
module.exports = {
  flattenMap,
  sortRelatedItems,
  calculateTime,
  filterSearchItems,
  getPropertyArray,
};
