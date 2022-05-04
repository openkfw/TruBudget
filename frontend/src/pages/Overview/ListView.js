import React from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import ContentAdd from "@mui/icons-material/Add";
import strings from "../../localizeStrings";
import ProjectAccordion from "./ProjectAccordion";
import { canCreateProject } from "../../permissions";

const ListView = props => {
  const {
    filteredProjects,
    history,
    highlightingRegex,
    users,
    fetchAllProjectDetails,
    showSearchBar,
    storeSearchTerm,
    searchTermArray,
    showProjectPermissions,
    showEditDialog,
    showCreationDialog,
    allowedIntents
  } = props;

  return (
    <>
      <Box>
        {filteredProjects?.map(project => (
          <ProjectAccordion
            project={project.data}
            allowedIntents={project.allowedIntents}
            highlightingRegex={highlightingRegex}
            history={history}
            key={project.data.id}
            users={users}
            fetchAllProjectDetails={fetchAllProjectDetails}
            showSearchBar={showSearchBar}
            storeSearchTerm={storeSearchTerm}
            searchTermArray={searchTermArray}
            showProjectPermissions={showProjectPermissions}
            showEditDialog={showEditDialog}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Tooltip id="tooltip-pcreate" title={strings.common.create}>
          <div>
            <Fab
              sx={{ height: "64px", width: "64px", marginTop: "-20px" }}
              aria-label="create"
              disabled={!canCreateProject(allowedIntents)}
              onClick={() => showCreationDialog()}
              color="primary"
              data-test="create-project-button"
            >
              <ContentAdd />
            </Fab>
          </div>
        </Tooltip>
      </Box>
    </>
  );
};

export default ListView;
