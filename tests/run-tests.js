#!/usr/bin/env node
// Headless runner for tests/test-ratings.html — executes the browser suite
// unmodified in a Node VM with a minimal DOM stub, then parses the rendered
// results. Exits 1 on any failure so it can gate CI and `npm test`.
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

// DOM stub: hand out recordable elements for any id/selector
const elements = {};
function makeEl(id) {
  if (!elements[id]) {
    elements[id] = {
      innerHTML: "", textContent: "", style: {}, className: "",
      setAttribute() {}, appendChild() {}, addEventListener() {},
      classList: { add() {}, remove() {} },
    };
  }
  return elements[id];
}

const storage = {};
const sandbox = {
  console,
  localStorage: {
    getItem: (k) => (k in storage ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  },
  document: {
    getElementById: makeEl,
    querySelector: makeEl,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => makeEl("__created__" + Math.random()),
    body: makeEl("__body__"),
  },
  navigator: { userAgent: "node-test" },
  setTimeout, clearTimeout,
};
sandbox.window = sandbox;
vm.createContext(sandbox);

function load(file) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
}

// App modules in dependency order (matches index.html)
["js/config.js", "js/storage.js", "js/conditions.js", "js/ratings.js"].forEach(load);

// Run every inline script from the test page, unmodified
const html = fs.readFileSync(path.join(__dirname, "test-ratings.html"), "utf8");
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  vm.runInContext(m[1], sandbox, { filename: "test-ratings.inline.js" });
}

// Collect rendered results from every element the suite wrote to
const rendered = Object.values(elements).map((e) => e.innerHTML + "\n" + e.textContent).join("\n");
const passCount = (rendered.match(/class="test pass"/g) || []).length;
const failMatches = [...rendered.matchAll(/class="test fail">([^<]*)/g)].map((m) => m[1]);

console.log(`${passCount} passed, ${failMatches.length} failed`);
if (failMatches.length > 0) {
  failMatches.forEach((f) => console.error("  " + f));
  process.exit(1);
}
if (passCount === 0) {
  console.error("No tests appear to have run — check the DOM stub.");
  process.exit(1);
}
