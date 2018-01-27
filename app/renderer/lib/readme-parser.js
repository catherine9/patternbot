'use strict';

const fs = require('fs');

const fileExists = require(`${__dirname}/../../shared/file-exists`);
const markdownFileParser = require(`${__dirname}/markdown-file-parser`);

const README_FILENAME = 'README.md';

// Allow both correct & American spelling
const normalizeSpelling = function (readme) {
  if (readme.attributes.colors) readme.attributes.colours = readme.attributes.colors;

  if (readme.attributes.typekit && /=/.test(readme.attributes.typekit)) readme.attributes.typekitId = readme.attributes.typekit.split(/=/)[0];

  if (readme.attributes.backgroundColor) readme.attributes.backgroundColour = readme.attributes.backgroundColor;
  if (!readme.attributes.backgroundColour) readme.attributes.backgroundColour = '#fff';

  if (readme.attributes.accentColor) readme.attributes.accentColour = readme.attributes.accentColor;

  return readme
};

const parse = function (folderpath) {
  return new Promise((resolve, reject) => {
    const readmepath = `${folderpath}/${README_FILENAME}`;

    if (!fileExists.check(readmepath)) return resolve(false);

    fs.readFile(readmepath, 'utf8', (err, data) => {
      let readme = markdownFileParser(data);

      readme = normalizeSpelling(readme);

      resolve(readme);
    });
  });
};

module.exports = {
  parse: parse,
};
