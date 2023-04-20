import React from "react";

import strings from "../../localizeStrings";
import Searchbar from "../Common/Searchbar";

const SubProjectSearch = ({
  searchBarDisplayed,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm
}) => {
  return (
    <Searchbar
      data-test="subproject-search"
      searchBarDisplayed={searchBarDisplayed}
      searchTerm={searchTerm}
      searchDisabled={searchDisabled}
      storeSearchBarDisplayed={storeSearchBarDisplayed}
      storeSearchTerm={storeSearchTerm}
      safeOnChange={true}
      previewText={strings.subproject.subproject_searchtext}
      isSearchBarDisplayedByDefault={true}
    />
  );
};

export default SubProjectSearch;
