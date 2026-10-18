import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { brotliDecompressSync } from "node:zlib";

test("BitLife retains a complete pinned runtime and the original SDK address", async () => {
  const root = new URL("games/bitlife/", import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("ASSET-MANIFEST.json", root), "utf8"));
  assert.equal(manifest.sourceCommit, "ae2fcc6d6a9cd051654fcc0519080db1f79cf2a7");
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL(asset.path, root));
    assert.equal(bytes.length, asset.bytes, asset.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256, asset.path);
  }
  const config = JSON.parse(await readFile(new URL("Build/BitLife.json", root), "utf8"));
  const wasm = brotliDecompressSync(await readFile(new URL(`Build/${config.wasmCodeUrl}`, root)));
  assert.equal(WebAssembly.validate(wasm), true);
  const data = brotliDecompressSync(await readFile(new URL(`Build/${config.dataUrl}`, root)));
  assert.equal(data.subarray(0, 16).toString(), "UnityWebData1.0\0");
  const headerLength = data.readUInt32LE(16);
  let cursor = 20;
  assert.ok(headerLength > cursor && headerLength <= data.length);
  while (cursor < headerLength) {
    assert.ok(cursor + 12 <= headerLength);
    const offset = data.readUInt32LE(cursor);
    const size = data.readUInt32LE(cursor + 4);
    const nameLength = data.readUInt32LE(cursor + 8);
    cursor += 12 + nameLength;
    assert.ok(cursor <= headerLength && offset >= headerLength && offset + size <= data.length);
  }
  const framework = brotliDecompressSync(await readFile(new URL(`Build/${config.wasmFrameworkUrl}`, root))).toString();
  assert.ok(framework.includes('//html5.api.gamedistribution.com/main.min.js'));
  assert.equal(framework.includes('js.src="/main.min.js"'), false);
});

test("Retro Bowl optional SDK absence never throws or fabricates an ad reward", async () => {
  const source = await readFile(new URL("games/retro-bowl/html5game/uph_poki.js", import.meta.url), "utf8");
  const context = { window: { location: { search: "?team=Test" } }, console: { log() {} }, URLSearchParams, setTimeout };
  vm.createContext(context);
  vm.runInContext(source, context);
  context.poki_gameplay_start();
  context.poki_gameplay_stop();
  context.poki_happy_time(1);
  assert.equal(context.poki_get_team_raw(), "Test");
  assert.equal(await new Promise((resolve) => context.poki_commercial_break_raw(resolve)), false);
  assert.equal(await new Promise((resolve) => context.poki_rewarded_break_raw(resolve)), false);
});

test("Basketball Stars keeps a functioning UTF8 decoder and local runtime library imports", async () => {
  const source = await readFile(new URL("games/basketball-stars/assets/main.min.js", import.meta.url), "utf8");
  const start = source.indexOf("new RegExp([");
  assert.ok(start >= 0);
  const expression = source.slice(start, source.indexOf('),cb_btou', start) + 1);
  const regex = vm.runInNewContext(expression);
  assert.equal(regex.test(String.fromCharCode(0xc3, 0xa9)), true);
  const game = await readFile(new URL("games/basketball-stars/assets/basketball_legends_2019.min.js", import.meta.url), "utf8");
  assert.equal(game.includes("cdn.rawgit.com"), false);
  for (const file of ["BlurX.js", "BlurY.js", "phaser-cachebuster.min.js", "phaser-super-storage.min.js"]) {
    assert.ok(game.includes(`vendor/${file}`));
    assert.ok((await readFile(new URL(`games/basketball-stars/vendor/${file}`, import.meta.url))).length);
  }
});

test("replacement soccer runtime matches its pinned source and declared download sizes", async () => {
  const root = new URL("games/super-liquid-soccer/", import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("ASSET-MANIFEST.json", root), "utf8"));
  assert.equal(manifest.sourceCommit, "1f91513e9134bc31ba87df29920ef5e46fc2b076");
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL(asset.path, root));
    assert.equal(bytes.length, asset.hostedBytes ?? asset.bytes, asset.path);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.hostedSha256 ?? asset.sha256, asset.path);
    if (asset.path !== "index.html") assert.equal(asset.hostedSha256, undefined, asset.path);
  }
  const html = await readFile(new URL("index.html", root), "utf8");
  const config = JSON.parse(html.match(/const GODOT_CONFIG = (\{[^\n]+\});/)[1]);
  for (const name of ["index.pck", "index.wasm"]) {
    assert.equal(config.fileSizes[name], (await readFile(new URL(name, root))).length);
  }
  assert.equal(config.serviceWorker, "");
  assert.equal(WebAssembly.validate(await readFile(new URL("index.wasm", root))), true);
});

test("all 641 soccer PCK assets are complete and match their embedded checksums", async () => {
  const pack = await readFile(new URL("games/super-liquid-soccer/index.pck", import.meta.url));
  assert.equal(pack.subarray(0, 4).toString(), "GDPC");
  assert.equal(pack.readUInt32LE(4), 1);
  const count = pack.readUInt32LE(84);
  assert.equal(count, 641);
  let cursor = 88;
  for (let i = 0; i < count; i++) {
    const length = pack.readUInt32LE(cursor);
    cursor += 4;
    const name = pack.subarray(cursor, cursor + length).toString();
    cursor += length;
    const offset = Number(pack.readBigUInt64LE(cursor));
    const size = Number(pack.readBigUInt64LE(cursor + 8));
    const expected = pack.subarray(cursor + 16, cursor + 32);
    cursor += 32;
    assert.ok(offset + size <= pack.length, name);
    assert.ok(createHash("md5").update(pack.subarray(offset, offset + size)).digest().equals(expected), name);
  }
});
