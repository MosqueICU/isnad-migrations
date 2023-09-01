const { muslim1 } = require('./books/muslim1.ts');

const generateMuslimSeed = () => {
  const hadith = [...muslim1];

  let sql = `INSERT INTO hadith (label, bookId, arabic, hadithNumber, englishTrans, primaryNarrator, collectionId ) VALUES `;
  hadith.forEach((h) => {
    sql += `("${h.label}", "${h.bookId}", "${h.arabic}", "${h.hadithNumber}", "${h.englishTrans}", "${h.primaryNarrator}" , "${h.collectionId}"),`;
  });
  sql = sql.slice(0, -1);

  return sql;
};

module.exports = generateMuslimSeed;
