import Searchbar from "../Common/Searchbar";
import React from "react";
import strings from "../../localizeStrings";

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
      autoSearch={true}
      previewText={strings.subproject.subproject_searchtext}
      isSearchBarDisplayedByDefault={true}
    />
  );
};

export default SubProjectSearch;
