import LocalizedStrings from "react-localization";

import en from "./languages/english";
import fr from "./languages/french";
import de from "./languages/german";
import pt from "./languages/portuguese";
import ka from "./languages/georgian";

const strings = new LocalizedStrings({
  en,
  fr,
  de,
  pt,
  ka
});

export default strings;
