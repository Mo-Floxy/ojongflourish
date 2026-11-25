import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROFILES = "C:/Users/HP/AppData/Local/Temp/opencode";
const TESTS = [
  "test:theme",
  "test:lyrics",
  "test:routes",
  "test:library",
  "test:audio",
  "test:persistence",
  "test:spotify",
];

const clearProfiles = () => {
  for (const entry of fs.readdirSync(PROFILES, { withFileTypes: true })) {
    if (entry.isDirectory() && (entry.name.startsWith("vyra-qa-") || entry.name.startsWith("vyra-diag"))) {
      fs.rmSync(path.join(PROFILES, entry.name), { recursive: true, force: true });
    }
  }
};

const run = (script) =>
  new Promise((resolve) => {
    const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => resolve(code ?? 1));
    child.on("error", (error) => {
      console.error(`Could not start ${script}:`, error);
      resolve(1);
    });
  });

const results = [];
for (const test of TESTS) {
  clearProfiles();
  console.log(`\n===== ${test} =====`);
  const code = await run(test);
  results.push({ test, code });
}

console.log("\n===== QA SUMMARY =====");
for (const result of results) {
  console.log(`${result.code === 0 ? "PASS" : "FAIL"}  ${result.test}`);
}
if (results.some((result) => result.code !== 0)) process.exitCode = 1;
