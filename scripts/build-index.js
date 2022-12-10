import fs from "fs";
import path from "path";
import { visit } from "unist-util-visit";
import { remark } from "remark";
import crypto from "crypto";

let index = [];
buildIndex();

async function buildIndex() {
  const contentFiles = fs.readdirSync(path.join(process.cwd(), "content"));
  contentFiles.forEach(async (file) => {
    const contentOfFile = fs.readFileSync(
      path.join(process.cwd(), "content", file),
      "utf-8"
    );
    await remark().use(remarkContentToRecords(file)).processSync(contentOfFile);
  });

  fs.writeFileSync("index.json", JSON.stringify(index), "utf-8");
}

function remarkContentToRecords(fileName) {
  const record = {
    headings: [],
    content: "",
    path: fileName.replace("md", ""),
    rank: Math.floor(Math.random() * 100),
    objectID: getObjectId(fileName),
  };

  return () => (tree) => {
    visit(tree, (node) => {
      if (node.type === "heading") {
        record.headings.push(node.children[0].value);
      }

      if (node.type === "paragraph") {
        record.content += remark.stringify(node);
      }
    });

    index = [...index, ...splitRecordsIfHeavy(record).flat()];
    // index.push(...splitRecordsIfHeavy(record).flat());
  };
}

function getObjectId(fileName) {
  return crypto.createHash("md5").update(fileName).digest("hex");
}

function splitRecordsIfHeavy(record, leafType = "") {
  if (isRecordHeavy(record)) {
    const { subRecord1, subRecord2 } = getSubRecords(record, leafType);

    return [
      ...splitRecordsIfHeavy(subRecord1, leafType + "l"),
      ...splitRecordsIfHeavy(subRecord2, leafType + "r"),
    ];
  }
  return [record];
}

function getSubRecords(record, leafType) {
  const { content, objectID, ...restProps } = record;
  const subRecord1 = {
    ...restProps,
    content: content.substring(0, content.length / 2),
    objectID: getObjectId(`${record.url}${leafType + "l"}`),
    hashInput: `${record.path}${leafType + "l"}`,
  };
  const subRecord2 = {
    ...restProps,
    content: content.substring(content.length / 2),
    objectID: getObjectId(`${record.url}${leafType + "r"}`),
    hashInput: `${record.path}${leafType + "r"}`,
  };
  return { subRecord1, subRecord2 };
}

function isRecordHeavy(record) {
  return Buffer.from(JSON.stringify(record)).length > 100000; // ~ 100KB
}