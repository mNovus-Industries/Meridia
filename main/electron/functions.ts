import { mainWindow } from "..";
import fs from "fs";
import { PythonShell } from "python-shell";
import { spawn } from "child_process";

export const get_file_content = ({ path }: { path: string }) => {
  try {
    console.log(path);
    const file_content = fs.readFileSync(path, "utf8");
    console.log("got file content", file_content);
    return file_content;
  } catch (err) {
    return err;
  }
};

export const run_code = ({ data }: { data: { path: string } }) => {
  try {
    const { path } = data;
    if (!path.endsWith(".py") && !path.endsWith(".js")) return;

    const isPython = path.endsWith(".py");
    let process: any;

    if (isPython) {
      process = new PythonShell(path, {
        pythonPath: PythonShell.defaultPythonPath,
        mode: "text",
        pythonOptions: ["-u"],
      });
    } else {
      process = spawn("node", [path]);
    }

    const handleOutput = (output: any) => {
      const message = output.toString().trim();
      console.log("Output:", message);
      mainWindow?.webContents.send("received-output", message);
    };

    if (!isPython && process.stdout) {
      process.stdout.on("data", handleOutput);
    }

    if (isPython) {
      process.on("message", handleOutput);
    }

    if (process.stderr) {
      process.stderr.on("data", (error: any) => {
        const errorMsg = `Error: ${error.toString().trim()}`;
        console.error(errorMsg);
        mainWindow?.webContents.send("received-output", errorMsg);
      });
    }
  } catch (err) {
    console.error("Execution Error:", err);
  }
};
