function isObject(x) {
  return x !== null && typeof x === "object";
}

function concat(x, y) {
  return x.concat(y);
}

function flatMap(f, xs) {
  return xs.map(f).reduce(concat, []);
}

function haltOnError(errors) {
  if (errors.length > 0) {
    console.log(`Errors:\n${errors.map(fmtError).join("\n")}`);
    process.exit(1);
  }
}

function fmtError(error) {
  if (Array.isArray(error)) return error.join(" -> ");
  else return error;
}

// ---

const translationsDir = "../src/languages";
const languages = ["english", "french", "german", "portuguese", "georgian"];

const translations = new Map(
  languages.map(lang => {
    const path = `${translationsDir}/${lang}.js`;
    return [lang, require(path).default];
  })
);

const categories = new Set(flatMap(Object.keys, [...translations.values()]));

// Check that all translations have all categories:
const missingTranslations = [];
for (const category of categories) {
  for (const [lang, obj] of translations.entries()) {
    if (!obj[category]) {
      missingTranslations.push([lang, category]);
    }
  }
}

haltOnError(missingTranslations);

for (const category of categories) {
  const categoryObjects = [...translations.values()].map(obj => obj[category]);
  const keys = new Set(flatMap(Object.keys, categoryObjects));

  // Check that all translations have all keys for the current category:
  for (const key of keys) {
    for (const [lang, obj] of translations.entries()) {
      if (!obj[category][key]) {
        missingTranslations.push([lang, category, key]);
      }
    }
  }
}

haltOnError(missingTranslations);
