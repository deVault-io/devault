module.exports = flatMap;
module.exports = filterSearchItems;
const exclude = require("../data/exclude");

function flatMap(array, mapper) {
  return [].concat(...array.map(mapper));
}

function filterSearchItems(
  textToSearch,
  fieldToSearch,
  tagToSearch,
  nameToSearch
) {
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
  if (typeof tagToSearch == `object`) {
    console.log("i get here");
    const stringFromObject = JSON.stringify(tagToSearch);
    console.log(`string from object ${stringFromObject}`);
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
}
