// require babel-register and set Babel presets options to es2015
require('babel-register')({
  presets: [ 'es2015' ]
});

require("./check-translations.es6.js");
