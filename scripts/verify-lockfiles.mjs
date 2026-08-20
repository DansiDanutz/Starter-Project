import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("package.json", "utf8"));
const npmLock = JSON.parse(await readFile("package-lock.json", "utf8"));
const bunLock = await readFile("bun.lock", "utf8");

const expected = {
  "@babel/core": manifest.overrides["@babel/core"],
  "brace-expansion": manifest.overrides["brace-expansion"],
  postcss: manifest.overrides.postcss,
  vite: manifest.devDependencies.vite.replace(/^\^/u, ""),
};

for (const [name, version] of Object.entries(expected)) {
  assert.equal(npmLock.packages[`node_modules/${name}`]?.version, version, `${name} npm lock drifted`);
  assert.match(bunLock, new RegExp(`"${name.replace("/", "\\/")}": \\["${name.replace("/", "\\/")}@${version}"`), `${name} bun lock drifted`);
}

console.log("npm and Bun lockfiles agree on protected dependency versions");
