var fs = require('fs');
var path = require('path');
var browserify = require('browserify');

var bundled = browserify({ debug: true })
  .addEntry(path.join(__dirname, 'core/Engine.js'))
  .bundle();

fs.writeFileSync(path.join(__dirname, 'bundle.js'), bundled, 'utf-8');
