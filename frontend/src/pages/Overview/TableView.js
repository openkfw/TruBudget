import React from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Tooltip from "@mui/material/Tooltip";
import ContentAdd from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import strings from "../../localizeStrings";
import ProjectAccordion from "./ProjectAccordion";
import { canCreateProject } from "../../permissions";
import DataTable from "react-data-table-component";

const columns = [
  {
    name: <Typography>Title</Typography>,
    selector: row => row.title,
    sortable: true
  },
  {
    name: "Year",
    selector: row => row.year,
    sortable: true
  }
];

const data = [
  {
    id: 1,
    title: "Beetlejuice",
    year: "1988"
  },
  {
    id: 2,
    title: "Ghostbusters",
    year: "1984"
  }
];

const TableView = props => {
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

  return <DataTable columns={columns} data={data} />;
  // return (
  //   <>
  //     <Box>
  //       {filteredProjects?.map(project => (
  //         <ProjectAccordion
  //           project={project.data}
  //           allowedIntents={project.allowedIntents}
  //           highlightingRegex={highlightingRegex}
  //           history={history}
  //           key={project.data.id}
  //           users={users}
  //           fetchAllProjectDetails={fetchAllProjectDetails}
  //           showSearchBar={showSearchBar}
  //           storeSearchTerm={storeSearchTerm}
  //           searchTermArray={searchTermArray}
  //           showProjectPermissions={showProjectPermissions}
  //           showEditDialog={showEditDialog}
  //         />
  //       ))}
  //     </Box>
  //     <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
  //       <Tooltip id="tooltip-pcreate" title={strings.common.create}>
  //         <div>
  //           <Fab
  //             sx={{ height: "64px", width: "64px", marginTop: "-20px" }}
  //             aria-label="create"
  //             disabled={!canCreateProject(allowedIntents)}
  //             onClick={() => showCreationDialog()}
  //             color="primary"
  //             data-test="create-project-button"
  //           >
  //             <ContentAdd />
  //           </Fab>
  //         </div>
  //       </Tooltip>
  //     </Box>
  //   </>
  // );
};

export default TableView;
