import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

import ContentAdd from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Fab from "@mui/material/Fab";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";

import { isEmptyDeep, stringToUnixTs, unixTsToString } from "../../helper";
import strings from "../../localizeStrings";
import {
  canCreateProject,
  canUpdateProject,
  canViewProjectDetails,
  canViewProjectPermissions
} from "../../permissions";
import ActionButton from "../Common/ActionButton";
import Searchbar from "../Common/Searchbar";
import SelectablePill from "../Common/SelectablePill";

import BudgetsList from "./BudgetsList";
import FilterMenu from "./FilterMenu";

// Documentation for this custom react data table:
// https://react-data-table-component.netlify.app/?path=/story/columns-cells-custom-cells--custom-cells

const ProjectButtons = ({
  project,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  allowedIntents
}) => {
  const isOpen = project.status === "open";
  const isAdditionalDataEmpty = isEmptyDeep(project.additionalData);
  const canViewPermissions = canViewProjectPermissions(allowedIntents);
  const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
  const viewDisabled = !canViewProjectDetails(allowedIntents);

  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", gap: "20px" }}>
      <ActionButton
        ariaLabel="show project data"
        notVisible={isAdditionalDataEmpty}
        onClick={() => {
          showProjectAdditionalData(project.id);
        }}
        title="Additional Data"
        icon={<MoreIcon />}
        data-test={`project-overview-additionaldata-${project.id}`}
      />
      <ActionButton
        ariaLabel="show project"
        notVisible={viewDisabled}
        onClick={() => {
          navigate("/projects/" + project.id);
        }}
        title={strings.common.view}
        alignTooltip="top"
        icon={<LaunchIcon />}
        data-test={`project-view-${project.id}`}
      />
      <ActionButton
        ariaLabel="show project permissions"
        notVisible={!canViewPermissions}
        onClick={() => showProjectPermissions(project.id, project.displayName)}
        title={strings.common.show_permissions}
        alignTooltip="top"
        icon={<PermissionIcon />}
        data-test={`project-permissions-${project.id}`}
      />
      <ActionButton
        ariaLabel="show edit dialog"
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

const TableViewEditor = ({ showTags, setShowTags, showBudgets, setShowBudgets }) => {
  return (
    <Box>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={showTags} onChange={(e) => setShowTags(e.target.checked)} />}
          label="Tags"
        />
        <FormControlLabel
          control={<Checkbox checked={showBudgets} onChange={(e) => setShowBudgets(e.target.checked)} />}
          label="Budgets"
        />
      </FormGroup>
    </Box>
  );
};

const rawColumns = [
  // Documentation: https://react-data-table-component.netlify.app/?path=/docs/api-columns--page
  {
    id: "project_name_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.project}
      </Typography>
    ),
    selector: (row) => row.data.projectName,
    sortField: "name",
    sortable: true,
    compact: false,
    minWidth: "15rem",
    cell: (row) => <Typography data-test="project-name">{row.data.projectName}</Typography>
  },
  {
    id: "project_status_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.status}
      </Typography>
    ),
    selector: (row) => row.data.projectStatus,
    sortField: "status",
    sortable: true,
    compact: true,
    minWidth: "5rem",
    cell: (row) => <Typography>{row.data.projectStatus}</Typography>
  },
  {
    id: "project_date_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.created}
      </Typography>
    ),
    selector: (row) => row.data.creationUnixTs, // time in ms to use the built-in sort
    sortField: "date",
    sortable: true,
    compact: true,
    minWidth: "10rem",
    cell: (row) => <Typography>{row.data.createdDate}</Typography> // formatted date that is shown
  },
  {
    id: "project_assignee_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.assignee}
      </Typography>
    ),
    selector: (row) => row.data.assignee,
    sortField: "assignee",
    sortable: true,
    compact: true,
    minWidth: "5rem",
    cell: (row) => <Typography>{row.data.assignee}</Typography>
  },
  {
    id: "project_tags_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.tags}
      </Typography>
    ),
    sortable: false,
    compact: true,
    minWidth: "0rem",
    maxWidth: "20rem",
    cell: (row) => row.components.Tags
  },
  {
    id: "project_budgets_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.budget}
      </Typography>
    ),
    sortable: false,
    compact: true,
    minWidth: "0rem",
    maxWidth: "20rem",
    cell: (row) => row.components.Budgets
  },
  {
    id: "action_buttons_column",
    name: (
      <Typography variant="subtitle2" sx={{ fontSize: "1.1rem" }}>
        {strings.common.actions}
      </Typography>
    ),
    sortable: false,
    right: true,
    compact: false,
    minWidth: "20rem",
    cell: (row) => row.components.ProjectButtons
  }
];

const formatTable = ({
  projects,
  showEditDialog,
  showProjectPermissions,
  showProjectAdditionalData,
  storeSearchTerm,
  searchTermArray
}) => {
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
            showProjectAdditionalData={showProjectAdditionalData}
            allowedIntents={project.allowedIntents}
          />
        ),
        Tags: (
          <Box sx={{ display: "flex", flexWrap: "wrap", overflow: "auto", maxHeight: "100px" }}>
            {project.data.tags?.map((tag) => (
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
        ),
        Budgets: <BudgetsList budgets={project.data.projectedBudgets} />
      }
    };
    return row;
  });
  return projectRows;
};

const TableView = (props) => {
  const {
    disableLiveUpdates,
    enabledUsers,
    enableLiveUpdates,
    filteredProjects,
    isDataLoading,
    isLiveUpdateAllProjectsEnabled,
    pagination,
    searchTerm,
    showCreationDialog,
    showEditDialog,
    showNavSearchBar, // to open the search bar for CardView in NavBar,
    showProjectAdditionalData,
    showProjectPermissions,
    storeSearchTerm,
    setPage,
    setRowsPerPage,
    setSort
  } = props;

  const hasSearchTerm = searchTerm !== "";
  const projects = filteredProjects;

  const [status, setStatus] = useState("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [columns, setColumns] = useState(rawColumns);
  const [showTags, setShowTags] = useState(true);
  const [showBudgets, setShowBudgets] = useState(true);
  const [table, setTable] = useState(
    formatTable({
      projects,
      showEditDialog,
      showProjectPermissions,
      showProjectAdditionalData,
      storeSearchTerm,
      searchTerm
    })
  );

  useEffect(() => {
    // only enable live updates if they were enabled before
    if (isLiveUpdateAllProjectsEnabled) {
      if (hasSearchTerm) {
        disableLiveUpdates();
      } else {
        enableLiveUpdates();
      }
    }
  }, [disableLiveUpdates, enableLiveUpdates, hasSearchTerm, isLiveUpdateAllProjectsEnabled]);

  useEffect(() => {
    // Update Table when new project was created
    setTable(
      formatTable({
        projects,
        showEditDialog,
        showProjectPermissions,
        showProjectAdditionalData,
        storeSearchTerm,
        searchTerm
      })
    );
  }, [projects, searchTerm, showEditDialog, showProjectPermissions, showProjectAdditionalData, storeSearchTerm]);

  const handleSearch = useCallback(() => {
    if (!projects) {
      return;
    }
    if (projects?.length === 0) {
      return;
    }
    let filtered = projects;

    const hasStatus = status !== "all";
    const hasAssignee = assigneeId !== "all";
    const hasStartDate = startDate !== null;
    const hasEndDate = endDate !== null;
    if (!hasSearchTerm && !hasStartDate && !hasEndDate && !hasStatus && !hasAssignee) {
      // Filtered with no active filter: all projects shown
      setTable(
        formatTable({
          projects,
          showEditDialog,
          showProjectPermissions,
          showProjectAdditionalData,
          storeSearchTerm,
          searchTerm
        })
      );
      return;
    }
    if (hasSearchTerm) {
      // Search happens in redux the same way as in CardView
      // Open SearchBar for CardView:
      showNavSearchBar();
    }
    if (hasStartDate) {
      const startUnixTs = stringToUnixTs(startDate);
      filtered = filtered.filter((project) => project.data?.creationUnixTs >= startUnixTs - 1);
    }
    if (hasEndDate) {
      // Since Datepicker returns the date from the start of the day (00:00) but a project timestamp also contains
      // the time in hours, minutes, seconds; We need to round the time up to the end of that day ( from 00:00 to 23:59)
      const dayInSeconds = 86400;
      const endUnixTs = stringToUnixTs(endDate) + dayInSeconds - 1;
      filtered = filtered.filter((project) => project.data?.creationUnixTs <= endUnixTs);
    }
    if (hasStatus) {
      filtered = filtered.filter((project) => project.data?.status === status);
    }
    if (hasAssignee) {
      filtered = filtered.filter((project) => project.data?.assignee === assigneeId);
    }
    setTable(
      formatTable({
        projects: filtered,
        showEditDialog,
        showProjectPermissions,
        showProjectAdditionalData,
        storeSearchTerm,
        searchTerm
      })
    );
  }, [
    projects,
    status,
    assigneeId,
    startDate,
    endDate,
    hasSearchTerm,
    showEditDialog,
    showProjectPermissions,
    showProjectAdditionalData,
    storeSearchTerm,
    searchTerm,
    showNavSearchBar
  ]);

  const handleReset = useCallback(() => {
    storeSearchTerm("");
    setStatus("all");
    setAssigneeId("all");
    setStartDate(null);
    setEndDate(null);
    setTable(
      formatTable({
        projects,
        showEditDialog,
        showProjectPermissions,
        showProjectAdditionalData,
        storeSearchTerm,
        searchTerm
      })
    );
  }, [projects, searchTerm, showEditDialog, showProjectPermissions, showProjectAdditionalData, storeSearchTerm]);

  useEffect(() => {
    // Update Table when new project was created
    setTable(
      formatTable({
        projects,
        showEditDialog,
        showProjectPermissions,
        showProjectAdditionalData,
        storeSearchTerm,
        searchTerm
      })
    );
  }, [projects, searchTerm, showEditDialog, showProjectPermissions, showProjectAdditionalData, storeSearchTerm]);

  useEffect(() => {
    // Search on change: Since handleSearch uses useCallback, the function will change according to
    // to its dependency array. When this happens, this useEffect will be triggered
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    // Enable or disable columns in the Table
    const currentColumns = rawColumns.filter((c) => {
      if (!showTags && c.id === "project_tags_column") {
        return false;
      }
      if (!showBudgets && c.id === "project_budgets_column") {
        return false;
      }
      return true;
    });

    setColumns([...currentColumns]);
  }, [showBudgets, showTags]);

  const actionsMemo = useMemo(
    () => (
      <>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginTop: "30px",
            marginBottom: "30px"
          }}
        >
          <Box sx={{ display: "block" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Searchbar
                isSearchBarDisplayedByDefault={true}
                searchDisabled={false}
                safeOnChange={true}
                previewText={strings.project.project_searchtext}
                searchTerm={searchTerm}
                storeSearchTerm={(word) => storeSearchTerm(word)}
              />
              <ActionButton
                ariaLabel="show filter"
                onClick={() => setShowFilter(!showFilter)}
                icon={<FilterAltIcon />}
                data-test="open-filter"
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
          <Box sx={{ marginRight: "150px" }}>
            <TableViewEditor
              showTags={showTags}
              setShowTags={setShowTags}
              showBudgets={showBudgets}
              setShowBudgets={setShowBudgets}
            />
          </Box>
        </Box>
      </>
    ),
    [
      searchTerm,
      showFilter,
      startDate,
      endDate,
      status,
      handleReset,
      assigneeId,
      enabledUsers,
      showTags,
      showBudgets,
      storeSearchTerm
    ]
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
      <DataTable
        columns={columns}
        data={table}
        title={actionsMemo}
        highlightOnHover
        progressPending={isDataLoading}
        pagination={true}
        paginationServer={true}
        paginationTotalRows={pagination?.totalRecords}
        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => setRowsPerPage(currentRowsPerPage, currentPage)}
        onChangePage={(page, _totalRows) => setPage(page)}
        onSort={(column, sortDirection) => setSort(column.sortField, sortDirection)}
        sortServer
        paginationRowsPerPageOptions={[5, 10, 15, 20, 50, 100]}
        data-test="project-list"
      />
    </>
  );
};

export default TableView;
