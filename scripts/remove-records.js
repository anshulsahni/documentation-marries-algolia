import algoliasearch from "algoliasearch";

removeRecords();

function removeRecords() {
  console.log(JSON.stringify(process.env.DELETED_FILES));
  console.log("-------");
  console.log(JSON.stringify(process.env.RENAMED_FILES));
}
