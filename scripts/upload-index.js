import algoliasearch from "algoliasearch";
import fs from "fs";
import path from "path";

const algoliaAppId = "JJYSHMX0C4";
const algoliaSecret = process.env.ALGOLIA_SECRET;

uploadIndex();

function uploadIndex() {
  // Reading Index file
  const records = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "index.json"), "utf-8")
  );

  algoliasearch(algoliaAppId, algoliaSecret)
    .initIndex("documentation-marries-algolia")
    .saveObjects(records)
    .then(() => {
      console.log("records uploaded successfully");
    })
    .catch((error) => {
      console.error(error);
    });

  console.log(records.length);
}
