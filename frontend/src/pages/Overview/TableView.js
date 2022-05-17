import React, { useState, useMemo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import ContentAdd from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import Typography from "@mui/material/Typography";
import strings from "../../localizeStrings";
import {
  canCreateProject,
  canUpdateProject,
  canViewProjectPermissions,
  canViewProjectDetails
} from "../../permissions";
import Searchbar from "../Common/Searchbar";
import { unixTsToString, stringToUnixTs } from "../../helper";
import DataTable from "react-data-table-component";
import ActionButton from "../Common/ActionButton";
import SelectablePill from "../Common/SelectablePill";
import FilterMenu from "./FilterMenu";
import { useHistory } from "react-router-dom";

// Documentation for this custom react data table:
// https://react-data-table-component.netlify.app/?path=/story/columns-cells-custom-cells--custom-cells

const ProjectButtons = ({ project, showEditDialog, showProjectPermissions, allowedIntents }) => {
  const isOpen = project.status === "open";
  const canViewPermissions = canViewProjectPermissions(allowedIntents);
  const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
  const viewDisabled = !canViewProjectDetails(allowedIntents);
  const history = useHistory();
  return (
    <Box sx={{ display: "flex", gap: "20px" }}>
      <ActionButton
        notVisible={viewDisabled}
        onClick={() => {
          history.push("/projects/" + project.id);
        }}
        title={strings.common.view}
        alignTooltip="top"
        icon={<LaunchIcon />}
        data-test={`project-view-${project.id}`}
      />
      <ActionButton
        notVisible={!canViewPermissions}
        onClick={() => showProjectPermissions(project.id, project.displayName)}
        title={strings.common.show_permissions}
        alignTooltip="top"
        icon={<PermissionIcon />}
        data-test={`project-permissions-${project.id}`}
      />
      <ActionButton
        notVisible={!isOpen || editDisabled}
        onClick={() => {
          showEditDialog(
            project.id,
            project.displayName,
            project.description,
            project.thumbnail,
            project.projectedBudgets,
            project.tags
          );
        }}
        title={strings.common.edit}
        alignTooltip="top"
        icon={<EditIcon />}
        data-test={`project-edit-${project.id}`}
      />
    </Box>
  );
};

const columns = [
  // Documentation: https://react-data-table-component.netlify.app/?path=/docs/api-columns--page
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Project
      </Typography>
    ),
    selector: row => row.data.projectName,
    sortable: true,
    compact: false,
    minWidth: "25rem",
    cell: row => <Typography>{row.data.projectName}</Typography>
  },
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Status
      </Typography>
    ),
    selector: row => row.data.projectStatus,
    sortable: true,
    compact: true,
    minWidth: "5rem",
    cell: row => <Typography>{row.data.projectStatus}</Typography>
  },
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Created
      </Typography>
    ),
    selector: row => row.data.creationUnixTs, // time in ms to use the built-in sort
    sortable: true,
    compact: true,
    minWidth: "10rem",
    cell: row => <Typography>{row.data.createdDate}</Typography> // formatted date that is shown
  },
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Assignee
      </Typography>
    ),
    selector: row => row.data.assignee,
    sortable: true,
    compact: true,
    minWidth: "10rem",
    cell: row => <Typography>{row.data.assignee}</Typography>
  },
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Tags
      </Typography>
    ),
    sortable: false,
    compact: true,
    minWidth: "20rem",
    cell: row => row.components.Tags
  },
  {
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        Actions
      </Typography>
    ),
    sortable: false,
    right: true,
    compact: false,
    minWidth: "15rem",
    cell: row => row.components.ProjectButtons
  }
];

const formatTable = ({ projects, showEditDialog, showProjectPermissions, storeSearchTerm, searchTermArray }) => {
  const projectRows = projects.map((project, index) => {
    const row = {
      data: {
        id: index,
        projectId: project.data.id,
        projectName: project.data.displayName,
        projectStatus: project.data.status,
        assignee: project.data.assignee,
        tags: project.data.tags || [],
        creationUnixTs: project.data.creationUnixTs,
        createdDate: unixTsToString(project.data.creationUnixTs)
      },
      components: {
        ProjectButtons: (
          <ProjectButtons
            project={project.data}
            showEditDialog={showEditDialog}
            showProjectPermissions={showProjectPermissions}
            allowedIntents={project.allowedIntents}
          />
        ),
        Tags: (
          <Box sx={{ display: "flex", flexWrap: "wrap", overflow: "auto", maxHeight: "100px" }}>
            {project.data.tags?.map(tag => (
              <SelectablePill
                key={tag}
                isSelected={searchTermArray?.includes(tag) || false}
                onClick={() => {
                  storeSearchTerm(`tag:${tag}`);
                }}
                data-test="table-view-tag"
                label={tag}
              ></SelectablePill>
            ))}
          </Box>
        )
      }
    };
    return row;
  });
  return projectRows;
};

const TableView = props => {
  const {
    filteredProjects,
    showEditDialog,
    showProjectPermissions,
    showCreationDialog,
    enabledUsers,
    storeSearchTerm,
    searchTerm,
    searchTermArray, // this shit is for tags
    showNavSearchBar // to open the search bar for CardView in NavBar
  } = props;

  const projects = filteredProjects;

  // const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [table, setTable] = useState(
    formatTable({ projects, showEditDialog, showProjectPermissions, storeSearchTerm, searchTerm })
  );

  useEffect(() => {
    console.log("WHUT");
    console.log(filteredProjects);
  }, [filteredProjects]);

  useEffect(() => {
    // Update Table when new project was created
    setTable(formatTable({ projects, showEditDialog, showProjectPermissions, storeSearchTerm, searchTerm }));
  }, [projects, searchTerm, showEditDialog, showProjectPermissions, storeSearchTerm]);

  const handleSearch = useCallback(() => {
    if (!projects) {
      return;
    }
    if (projects?.length === 0) {
      return;
    }
    let filtered = projects;
    const hasSearchTerm = searchTerm !== "";
    const hasStatus = status !== "all";
    const hasAssignee = assigneeId !== "all";
    const hasStartDate = startDate !== null;
    const hasEndDate = endDate !== null;
    if (!hasSearchTerm && !hasStartDate && !hasEndDate && !hasStatus && !hasAssignee) {
      // Filtered with no active filter: all projects shown
      setTable(formatTable({ projects, showEditDialog, showProjectPermissions, storeSearchTerm, searchTerm }));
      setIsFiltered(false);
      return;
    }
    if (hasSearchTerm) {
      // Search happens in redux the same way as in CardView
      // Open SearchBar for CardView:
      showNavSearchBar();
    }
    if (hasStartDate) {
      const startUnixTs = stringToUnixTs(startDate);
      filtered = filtered.filter(project => project.data?.creationUnixTs >= startUnixTs - 1);
    }
    if (hasEndDate) {
      // Since Datepicker returns the date from the start of the day (00:00) but a project timestamp also contains
      // the time in hours, minutes, seconds; We need to round the time up to the end of that day ( from 00:00 to 23:59)
      const dayInSeconds = 86400;
      const endUnixTs = stringToUnixTs(endDate) + dayInSeconds - 1;
      filtered = filtered.filter(project => project.data?.creationUnixTs <= endUnixTs);
    }
    if (hasStatus) {
      filtered = filtered.filter(project => project.data?.status === status);
    }
    if (hasAssignee) {
      filtered = filtered.filter(project => project.data?.assignee === assigneeId);
    }
    setTable(formatTable({ projects: filtered, showEditDialog, showProjectPermissions, storeSearchTerm, searchTerm }));
    setIsFiltered(true);
  }, [
    projects,
    searchTerm,
    status,
    assigneeId,
    startDate,
    endDate,
    showEditDialog,
    showProjectPermissions,
    storeSearchTerm,
    showNavSearchBar
  ]);

  const handleReset = useCallback(() => {
    storeSearchTerm("");
    setStatus("all");
    setAssigneeId("all");
    setStartDate(null);
    setEndDate(null);
    setIsFiltered(false);
    setTable(formatTable({ projects, showEditDialog, showProjectPermissions, storeSearchTerm, searchTerm }));
  }, [projects, searchTerm, showEditDialog, showProjectPermissions, storeSearchTerm]);

  useEffect(() => {
    // Search on change: Since handleSearch uses useCallback, the function will change according to
    // to its dependency array. When this happens, this useEffect will be triggered
    handleSearch();
  }, [handleSearch]);

  const actionsMemo = useMemo(
    () => (
      <>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ display: "block", margin: "0px" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Searchbar
                isSearchBarDisplayedByDefault={true}
                searchDisabled={false}
                safeOnChange={true}
                previewText="Search Projects"
                searchTerm={searchTerm}
                storeSearchTerm={word => storeSearchTerm(word)}
              />
              <ActionButton
                onClick={() => setShowFilter(!showFilter)}
                icon={<FilterAltIcon />}
                data-test={`open-filter`}
              />
            </Box>
            <Box sx={{ marginLeft: "23px" }}>
              {showFilter && (
                <FilterMenu
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  status={status}
                  setStatus={setStatus}
                  handleReset={handleReset}
                  assigneeId={assigneeId}
                  setAssigneeId={setAssigneeId}
                  users={enabledUsers}
                />
              )}
            </Box>
          </Box>
        </Box>
      </>
    ),
    [searchTerm, showFilter, startDate, endDate, status, handleReset, assigneeId, enabledUsers, storeSearchTerm]
  );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <div>
          <Fab
            sx={{ height: "64px", width: "64px", marginBottom: "-120px", marginRight: "-32px" }}
            aria-label="create"
            disabled={!canCreateProject(props.allowedIntents)}
            onClick={() => showCreationDialog()}
            color="primary"
            data-test="create-project-button"
          >
            <ContentAdd />
          </Fab>
        </div>
      </Box>
      <DataTable columns={columns} data={table} title={actionsMemo} highlightOnHover pagination />
    </>
  );
};

export default TableView;
