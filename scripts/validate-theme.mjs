#!/usr/bin/env node
/** Dependency-free structural checks for this Shopify Online Store 2.0 theme. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const issues = [];
const counts = { json: 0, schemas: 0, sectionRefs: 0, orderRefs: 0, blockRefs: 0 };

function filesUnder(dir) {
  const start = join(root, dir);
  if (!existsSync(start)) return [];
  const files = [];
  function walk(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) files.push(relative(root, child));
    }
  }
  walk(start);
  return files;
}

const jsonFiles = ['templates', 'sections', 'section-groups', 'config', 'locales']
  .flatMap(filesUnder)
  .filter(path => path.endsWith('.json'));
const sectionFiles = new Set(filesUnder('sections').filter(path => path.endsWith('.liquid')));
const stripShopifyHeader = text => text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '');
const read = path => readFileSync(join(root, path), 'utf8');
const parsed = new Map();

for (const path of jsonFiles) {
  try {
    parsed.set(path, JSON.parse(stripShopifyHeader(read(path))));
    counts.json++;
  } catch (err) {
    issues.push(`${path}: invalid JSON (${err.message})`);
  }
}

for (const [path, data] of parsed) {
  if (!data || !data.sections) continue;
  if (typeof data.sections !== 'object' || Array.isArray(data.sections)) {
    issues.push(`${path}: sections must be an object`);
    continue;
  }
  for (const [id, section] of Object.entries(data.sections)) {
    counts.sectionRefs++;
    if (typeof section?.type !== 'string' || !section.type) {
      issues.push(`${path}: section '${id}' has no type`);
      continue;
    }
    if (!section.type.startsWith('@') && !sectionFiles.has(`sections/${section.type}.liquid`)) {
      issues.push(`${path}: '${id}' refers to missing sections/${section.type}.liquid (case-sensitive)`);
    }
    if (section.block_order !== undefined && !Array.isArray(section.block_order)) {
      issues.push(`${path}: section '${id}' block_order must be an array`);
    }
    const usedBlocks = new Set();
    for (const blockId of Array.isArray(section.block_order) ? section.block_order : []) {
      counts.blockRefs++;
      if (!Object.hasOwn(section.blocks ?? {}, blockId)) {
        issues.push(`${path}: section '${id}' block_order refers to missing block '${blockId}'`);
      }
      if (usedBlocks.has(blockId)) issues.push(`${path}: duplicate block '${blockId}' in '${id}' block_order`);
      usedBlocks.add(blockId);
    }
  }
  if (data.order !== undefined && !Array.isArray(data.order)) issues.push(`${path}: order must be an array`);
  const seen = new Set();
  for (const id of Array.isArray(data.order) ? data.order : []) {
    counts.orderRefs++;
    if (!Object.hasOwn(data.sections, id)) issues.push(`${path}: order refers to undefined section '${id}'`);
    if (seen.has(id)) issues.push(`${path}: duplicate section '${id}' in order`);
    seen.add(id);
  }
}

for (const path of sectionFiles) {
  const content = read(path);
  const schema = content.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  if (!schema) {
    issues.push(`${path}: missing {% schema %} block`);
    continue;
  }
  try {
    JSON.parse(schema[1]);
    counts.schemas++;
  } catch (err) {
    issues.push(`${path}: invalid section schema JSON (${err.message})`);
  }
}

for (const [template, expectedForm, sectionName] of [
  ['templates/product.json', /{%-?\s*form\s+['"]product['"]/, 'product'],
  ['templates/cart.json', /name=['"]checkout['"]/, 'cart']
]) {
  const templateData = parsed.get(template);
  if (!templateData) {
    issues.push(`${template}: missing or invalid critical template`);
    continue;
  }
  const type = templateData.sections?.main?.type;
  if (!type || !sectionFiles.has(`sections/${type}.liquid`)) {
    issues.push(`${template}: main section is missing`);
  } else if (!expectedForm.test(read(`sections/${type}.liquid`))) {
    issues.push(`${template}: main ${sectionName} section lacks the required native control`);
  }
}

console.log(`Validated ${counts.json} JSON files, ${counts.schemas} section schemas, ` +
  `${counts.sectionRefs} section references, ${counts.orderRefs} order references, ` +
  `${counts.blockRefs} block references.`);
if (issues.length) {
  for (const issue of issues) console.error(`ERROR: ${issue}`);
  console.error(`Theme integrity FAILED (${issues.length} issue(s)).`);
  process.exitCode = 1;
} else {
  console.log('Theme integrity PASS: no unresolved section, order, schema, or critical-form references.');
}
