const exclude = require("../data/exclude");

const flattenMap = (array,mapper) =>{
  return [].concat(...array.map(mapper));
}

const sortRelatedItems = (tool,otherTools)=>{
 let items=[];
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
    return items = otherTools
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
    }

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


module.exports = {flattenMap,sortRelatedItems,calculateTime}