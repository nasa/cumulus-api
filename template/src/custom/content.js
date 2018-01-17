const fs = require('fs');

/**
 * This file exports the content of your website, as a bunch of concatenated
 * Markdown files. By doing this explicitly, you can control the order
 * of content without any level of abstraction.
 *
 * Using the brfs module, fs.readFileSync calls in this file are translated
 * into strings of those files' content before the file is delivered to a
 * browser: the content is read ahead-of-time and included in bundle.js.
 */
module.exports =
  '# Introduction\n' +
  fs.readFileSync('./content/intro.md', 'utf8') + '\n' +

  '# Authentication\n' +
  fs.readFileSync('./content/auth.md', 'utf8') + '\n' +

  '# Providers\n' +
  fs.readFileSync('./content/providers.md', 'utf8') + '\n' +

  '# Collections\n' +
  fs.readFileSync('./content/collections.md', 'utf8') + '\n' +

  '# Granules\n' +
  fs.readFileSync('./content/granules.md', 'utf8') + '\n' +

  '# PDRs\n' +
  fs.readFileSync('./content/pdrs.md', 'utf8') + '\n' +

  '# Rules\n' + 
  fs.readFileSync('./content/rules.md', 'utf8') + '\n' +

  '# Stats\n' +
  fs.readFileSync('./content/stats.md', 'utf8') + '\n' +

  '# Logs\n' +
  fs.readFileSync('./content/logs.md', 'utf8') + '\n' +

  '# Schemas\n' +
  fs.readFileSync('./content/schemas.md', 'utf8') + '\n'
;
