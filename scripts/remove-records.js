import algoliasearch from "algoliasearch";

const algoliaAppId = "JJYSHMX0C4";
const algoliaSecret = process.env.ALGOLIA_SECRET;

removeRecords();

function removeRecords() {
  const deletedFiles = getDeleteFilesFromEnv();

  if (deletedFiles.length > 0) {
    const urlsOfDeletedFiles = getUrlsOfDeletedPages(deletedFiles);
    sendDeleteRequestToAlgolia(urlsOfDeletedFiles);
  } else {
    console.log("No deleted files found hence aborting delete operation");
    return;
  }
}

function sendDeleteRequestToAlgolia(urlsOfDeletedFiles = []) {
  // For `algolia.deleteBy()`: refer https://www.algolia.com/doc/api-reference/api-methods/delete-by/
  // For params format: refer https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/
  const algoliaDeleteParams = [urlsOfDeletedFiles.map((url) => `url:${url}`)];

  const algClient = algolia(algAppId, algWriteKey).initIndex(algIndexName);
  algClient
    .deleteBy({ facetFilters: algoliaDeleteParams })
    .then((algoliaResponse) => {
      console.log("File delete request placed", algoliaResponse);
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

function getDeleteFilesFromEnv() {
  try {
    // Double parsing, since somehow string coming from github workflow is escaped twice
    const deletedFiles = JSON.parse(
      JSON.parse(`"${process.env.DELETED_FILES}"`)
    );
    const oldRenamedFiles = getOldRenamedFiles();

    return [...deletedFiles, ...oldRenamedFiles];
  } catch (error) {
    console.error(error);
    throw new Error("Unable to parse deleted files from env");
  }
}

/**
 * This function retrieves the list of renamed files from repsective env variable RENAMED_FILES
 * the above env variable recieves the data in the following format
 *
 * old_path_1/to/file/index.md,new_path_1/to/file/index.md:old_path_2/file/index.md,new_path_2/file/index.md
 *
 * We're just interested in the old names of all the renamed files at this moment,
 * hence splitting the string using (:), then iterating over array then splitting with (,)
 * and getting the 0th value
 */
function getOldRenamedFiles() {
  if (!process.env.RENAMED_FILES) return [];
  const renamedFileStr = process.env.RENAMED_FILES;
  return renamedFileStr
    .split(":")
    .map((renamedFileSet) => renamedFileSet.split(",")[0]);
}

function getUrlsOfDeletedPages(deletedFiles = []) {
  return deletedFiles.map((file) =>
    file.replace(/(production\/content\/routes\/)|\/index.md/g, "")
  );
}

