import Searchbar from "../Navbar/Searchbar";
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
      previewText={strings.common.subproject_searchtext}
    />
  );
};

export default SubProjectSearch;
