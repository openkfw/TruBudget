import fs from "fs/promises";
import path from "path";

const items = await fs.readdir(".", { withFileTypes: true });

// create a string X
// go through specified directories
// // check if there is an environment-variables.md file
// // append content to X
// output to docs/environment-varaibles

for (const item of items) {
  // const fullPath = path.join(".", item.name);
  if (item.isDirectory()) {
    console.log(item);
  } else if (item.isFile() && item.name === "env-vars.md") {
    // await readEnvFile(dir);
    continue;
  }
}
