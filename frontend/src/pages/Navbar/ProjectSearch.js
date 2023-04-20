import React from "react";

import strings from "../../localizeStrings";
import Searchbar from "../Common/Searchbar";

const ProjectSearch = ({
  searchBarDisplayed,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm
}) => {
  return (
    <Searchbar
      data-test="project-search"
      searchDisabled={searchDisabled}
      searchBarDisplayed={searchBarDisplayed}
      searchTerm={searchTerm}
      storeSearchBarDisplayed={storeSearchBarDisplayed}
      storeSearchTerm={storeSearchTerm}
      safeOnChange={true}
      previewText={strings.project.project_searchtext}
    />
  );
};

export default ProjectSearch;
