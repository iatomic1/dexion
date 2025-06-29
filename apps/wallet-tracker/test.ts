import fs from "fs/promises";
import path from "path";
import { generateTransactionMessage } from "./src/parser";

async function runTests() {
  const txExamplesDir = "./tx-examples";
  const files = await fs.readdir(txExamplesDir);

  for (const file of files) {
    if (file.endsWith(".json")) {
      console.log(`
--- Testing ${file} ---
`);
      const filePath = path.join(txExamplesDir, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const txData = JSON.parse(fileContent);

      const message = generateTransactionMessage(txData);
      console.log(JSON.stringify(message, null, 2));
    }
  }
}

runTests().catch(console.error);
