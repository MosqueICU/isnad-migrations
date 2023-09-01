require("dotenv").config();

const generateBukhariSeed = require("./migrationData/bukhari/index.ts");
const generateMuslimSeed = require("./migrationData/muslim/index.ts");

const mysql = require("mysql2/promise");
const conn = mysql.createConnection(process.env.DATABASE_URL);

//Create Hadith Table
const createHadithTable = `
CREATE TABLE IF NOT EXISTS hadith (
    id INT NOT NULL AUTO_INCREMENT,
    collectionId VARCHAR(10) NOT NULL,
    bookId VARCHAR(10) NOT NULL,
    hadithNumber VARCHAR(10) NOT NULL,
    label VARCHAR(205) NOT NULL,
    arabic MEDIUMTEXT NOT NULL,
    englishTrans MEDIUMTEXT NOT NULL,
    primaryNarrator VARCHAR(3000) NOT NULL,
    PRIMARY KEY (id),
    INDEX (bookId),
    INDEX (collectionId)
);

`;

const migrate = () => {
  conn.query(createHadithTable, (err, results, fields) => {
    if (err) {
      console.log(err);
    }
    console.log(results);
  });
};

const drop = () => {
  conn.query("DROP TABLE hadith", (err, results, fields) => {
    if (err) {
      console.log(err);
    }
    console.log(results);
  });
};

const refresh = async () => {
  console.log("refreshing");
  // const bukhariSeed = generateBukhariSeed();
  const muslimSeed = generateMuslimSeed();

  await (await conn).query("DROP TABLE IF EXISTS hadith");
  console.log("Tables dropped");

  //Create Hadith Table
  await (await conn).query(createHadithTable);
  console.log("Hadith Table Created");

  const bukhariData = generateBukhariSeed();
  for (const hadith of bukhariData) {
    console.log("migrting book " + hadith.bookId + " hadith " + hadith.hadithNumber);
    await (
      await conn
    ).query(`INSERT INTO hadith (collectionId, bookId, hadithNumber, label, arabic, englishTrans, primaryNarrator) VALUES ( ?, ?, ?, ?, ?, ?, ?)`, [
      hadith.collectionId,
      hadith.bookId,
      hadith.hadithNumber,
      hadith.label,
      hadith.arabic,
      hadith.englishTrans,
      hadith.primaryNarrator || " ",
    ]);
  }
  console.log("Bukhari data inserted");

  // await (await conn).query(muslimSeed);
  // console.log('Muslim data inserted');

  console.log("refresh complete");

  process.exit();
};

try {
  //@ts-ignore
  const arg = process.argv.slice(2);
  switch (arg[0]) {
    case "refresh":
      refresh();
      break;
    case "migrate":
      migrate();
      break;
    case "drop":
      drop();
      break;
  }
} catch (e) {
  console.log(e);
  process.exit();
}
