require("dotenv").config();

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

var cheerio = require("cheerio");
var fs = require("fs");

let lastHadithNumber = 0;

const template = (currentBook, data) => {
  return `
 const bukhari${currentBook} = ${JSON.stringify(data)};

module.exports = { bukhari${currentBook} };

`;
};

const migrate = async (currentBook = 1) => {
  let hadithNumberInBook = 1;
  const html = await fetch("https://sunnah.com/bukhari/" + currentBook).then((res) => res.text());

  // load html into cheerio
  const $ = cheerio.load(html);

  let data = [];

  //get label

  $(".hadith_reference_sticky").each(function (i, elem) {
    data[i] = { ...data[i], label: $(this).text() };
    data[i] = { ...data[i], bookId: currentBook };
    data[i] = { ...data[i], collectionId: 1 };
    data[i] = { ...data[i], hadithNumberInBook: hadithNumberInBook };
    hadithNumberInBook++;
  });

  // get arabic hadith
  $(".arabic_hadith_full").each(function (i, elem) {
    data[i] = { ...data[i], arabic: $(this).html() };

    const label = data[i].label.split(" ");
    data[i] = {
      ...data[i],
      hadithNumber: label[label.length - 1],
    };

    lastHadithNumber++;
  });

  // get english translation
  $(".text_details").each(function (i, elem) {
    data[i] = { ...data[i], englishTrans: $(this).html() };
  });

  //get narrator
  $(".hadith_narrated").each(function (i, elem) {
    if (!$(this).text()) throw new Error("Narrator not found" + $(this).text());
    data[i] = { ...data[i], primaryNarrator: $(this).text() };
  });

  fs.writeFileSync(`migrationData/bukhari/books/bukhari${currentBook}.js`, template(currentBook, data));

  console.log("done with book " + currentBook);
  setTimeout(async () => {
    if (currentBook + 1 > 97) {
      console.log("done with all books");
      return process.exit();
    }
    await migrate(currentBook + 1);
  }, 300);
};

try {
  //@ts-ignore
  const arg = process.argv.slice(2);
  switch (arg[0]) {
    case "migrate":
      migrate(1);
      break;
  }
} catch (e) {
  console.log(e);
  process.exit();
}
