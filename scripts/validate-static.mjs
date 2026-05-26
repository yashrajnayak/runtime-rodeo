import { access, readFile } from "node:fs/promises";

const required = [
  "index.html",
  "favicon.svg",
  "src/app.js",
  "src/styles.css",
  "assets/game/arcade-command-room.png",
  "assets/readme/runtime-rodeo-preview.png",
  "assets/readme/runtime-rodeo-concept.png",
  "assets/readme/architecture-diagram.svg"
];

const forbiddenPatterns = [
  /\/Users\//i,
  new RegExp(`Documents/${"Codex"}`, "i"),
  new RegExp(`\\.${"codex"}`, "i"),
  new RegExp(`generated_${"images"}`, "i"),
  new RegExp(["Codex", "Community", "Meetups"].join(" "), "i"),
  new RegExp(["audience", "engagement"].join(" "), "i"),
  /file:\/\//i
];

for (const path of required) {
  await access(path);
}

for (const path of ["index.html", "src/app.js", "src/styles.css", "README.md", ".github/workflows/pages.yml"]) {
  const text = await readFile(path, "utf8");
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      throw new Error(`Forbidden local or scoped text found in ${path}: ${pattern}`);
    }
  }
}

console.log("Static validation passed.");
