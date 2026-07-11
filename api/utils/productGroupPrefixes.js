const fs = require('fs');
const path = require('path');

const PRODUCT_GROUP_PREFIXES_PATH = path.resolve(
  __dirname,
  './productGroupPrefixes.json',
);

const PRODUCT_GROUP_PREFIXES = [
  ...new Set(
    JSON.parse(fs.readFileSync(PRODUCT_GROUP_PREFIXES_PATH, 'utf8'))
      .map(prefix => `${prefix || ''}`.trim().toUpperCase())
      .filter(Boolean),
  ),
];

const normalizeGroupCode = code => `${code || ''}`.trim().toUpperCase();
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isAllowedGroupCode = code =>
  PRODUCT_GROUP_PREFIXES.some(prefix =>
    new RegExp(`^${escapeRegExp(prefix)}-\\d+$`).test(normalizeGroupCode(code)),
  );

module.exports = {
  PRODUCT_GROUP_PREFIXES,
  normalizeGroupCode,
  isAllowedGroupCode,
};
