import fs from "fs";
import path from "path";
import { visit } from "unist-util-visit";
import { remark } from "remark";

const index = [];
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

    index.push(record);
  };
}
