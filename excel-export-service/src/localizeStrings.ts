import LocalizedStrings from "localized-strings";

import en from "./languages/english";
import fr from "./languages/french";
import de from "./languages/german";
import pt from "./languages/portuguese";
import ka from "./languages/georgian";

export const languages = ["en", "fr", "de", "pt", "ka"];

const strings = new LocalizedStrings({
  en,
  fr,
  de,
  pt,
  ka,
});

export default strings;
