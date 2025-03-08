import { ipcMain } from "electron";
import fs from "fs/promises";
import { run_code } from "../electron/functions";

function extractVariables(code: string) {
  const variableRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)/gm;
  const variables: Record<string, string> = {};

  for (const match of code.matchAll(variableRegex)) {
    const [_, variableName, variableValue] = match;

    if (match.index !== undefined) {
      const lineStart = code.lastIndexOf("\n", match.index) + 1;
      const indentation =
        code.slice(lineStart, match.index).match(/^\s*/)?.[0] || "";

      if (indentation.length > 0) continue;
    }

    variables[variableName.trim()] = variableValue.trim();
  }

  return variables;
}

export function RegisterPythonWorker() {
  ipcMain.on("file-run", async (event, filePath) => {
    try {
      const code = await fs.readFile(filePath, "utf-8");
      const variables = extractVariables(code);

      run_code({ data: { path: filePath } });

      console.log("Extracted Variables:", variables);
      event.reply("variables-result", variables);
    } catch (error) {
      console.error("Error processing file:", error);
      event.reply("variables-error", error.message);
    }
  });
}
