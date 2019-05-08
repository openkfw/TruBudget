// require babel-register and set Babel presets options to es2015
require("@babel/register")({
  presets: ["@babel/preset-env"]
});

require("./check-translations.es6.js");
