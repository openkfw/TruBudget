import React, { useEffect } from "react";

import strings from "../../localizeStrings";
import Searchbar from "../Common/Searchbar";

const WorkflowitemSearch = ({
  searchBarDisplayed,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeWorkflowitemSearchTerm,
  disableLiveUpdatesSubproject,
  enableLiveUpdatesSubproject,
  isLiveUpdatesSubprojectEnabled
}) => {
  useEffect(() => {
    if (searchTerm) {
      disableLiveUpdatesSubproject();
    } else {
      if (!isLiveUpdatesSubprojectEnabled) enableLiveUpdatesSubproject();
    }
  }, [disableLiveUpdatesSubproject, enableLiveUpdatesSubproject, isLiveUpdatesSubprojectEnabled, searchTerm]);

  return (
    <Searchbar
      data-test="workflowitem-search"
      searchBarDisplayed={searchBarDisplayed}
      searchTerm={searchTerm}
      searchDisabled={searchDisabled}
      storeSearchBarDisplayed={storeSearchBarDisplayed}
      storeSearchTerm={storeWorkflowitemSearchTerm}
      safeOnChange={true}
      previewText={strings.workflow.search_text}
      isSearchBarDisplayedByDefault={true}
    />
  );
};

export default WorkflowitemSearch;
