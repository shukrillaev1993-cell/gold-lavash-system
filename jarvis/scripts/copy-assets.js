const fs = require("fs");
const path = require("path");

const files = ["index.html", "style.css"];
const srcDir = path.join(__dirname, "..", "src", "renderer");
const distDir = path.join(__dirname, "..", "dist", "renderer");

fs.mkdirSync(distDir, { recursive: true });
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
}
