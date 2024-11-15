import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import _isEmpty from "lodash/isEmpty";

import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ContentAdd from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton, InputAdornment, Menu, MenuItem, Select } from "@mui/material";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";

import { stringToUnixTs, trimSpecialChars, unixTsToString } from "../../helper";
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
import StatusChip from "../Common/StatusChip";

import BudgetsList from "./BudgetsList";
import FilterMenu from "./FilterMenu";

import "./TableView.scss";

// Documentation for this custom react data table:
// https://react-data-table-component.netlify.app/?path=/story/columns-cells-custom-cells--custom-cells

const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent"
    }
  },
  header: {
    style: {
      backgroundColor: "transparent",
      paddingLeft: 0
    }
  },
  headRow: {
    style: {
      backgroundColor: "transparent",
      borderBottom: "none"
    }
  },
  headCells: {
    style: {
      backgroundColor: "transparent",
      paddingLeft: 0,
      "&:not(:last-of-type)": {
        paddingRight: "1rem"
      }
    }
  },
  rows: {
    style: {
      cursor: "pointer",
      borderRadius: "4px",
      overflow: "hidden",
      marginBottom: "0.5rem",
      "&:not(:last-of-type)": {
        borderBottom: "none"
      }
    }
  },
  cells: {
    style: {
      width: "100%",
      paddingLeft: 0,
      "&:not(:last-of-type)": {
        paddingRight: "1rem"
      }
    }
  },
  pagination: {
    style: {
      display: "flex",
      border: "none",
      justifyContent: "center",
      alignItems: "center",
      padding: "0.625rem 0",
      backgroundColor: "transparent"
    }
  }
};

const webpVersion = (imagePath) => {
  // if imagePath matches Thumbnail_*.jpg, replace .jpg with .webp
  if (imagePath.match(/Thumbnail_\d+.jpg/)) {
    return imagePath.replace(".jpg", ".webp");
  }
  return imagePath;
};

const ProjectMenu = ({ project, showEditDialog, showProjectPermissions, allowedIntents }) => {
  const isOpen = project.status === "open";
  const canViewPermissions = canViewProjectPermissions(allowedIntents);
  const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
  const viewDisabled = !canViewProjectDetails(allowedIntents);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const theme = useTheme();
  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon
          sx={(theme) => ({
            border: "1px solid",
            borderRadius: "50%",
            padding: "0.5rem",
            borderColor: theme.palette.menuBorder,
            color: theme.palette.deepDarkBlue
          })}
        />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button"
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              marginTop: 2,
              border: "1px solid",
              borderColor: theme.palette.primaryBlue,
              boxShadow: `2px 4px 6px ${theme.palette.grey.light}`
            }
          }
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          aria-label="show edit dialog"
          disabled={!isOpen || editDisabled}
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
          data-test={`project-edit-${project.id}`}
        >
          <EditIcon fontSize="small" style={{ marginRight: "0.3rem" }} />
          {strings.common.edit}
        </MenuItem>
        <MenuItem
          aria-label="show project permissions"
          disabled={!canViewPermissions}
          onClick={() => showProjectPermissions(project.id, project.displayName)}
          data-test={`project-permissions-${project.id}`}
        >
          <SupervisorAccountIcon fontSize="small" style={{ marginRight: "0.3rem" }} />
          {strings.common.show_permissions}
        </MenuItem>
        <MenuItem
          aria-label="show project"
          disabled={viewDisabled}
          onClick={() => {
            navigate("/projects/" + project.id);
          }}
          data-test={`project-view-${project.id}`}
        >
          <VisibilityIcon fontSize="small" style={{ marginRight: "0.3rem" }} />
          {strings.common.view}
        </MenuItem>
        <MenuItem aria-label="copy link" data-test={`copy-link`}>
          <InsertLinkIcon fontSize="small" style={{ marginRight: "0.3rem" }} />
          {strings.common.copy_link}
        </MenuItem>
        <MenuItem aria-label="history" data-test={`history`}>
          <AccessTimeFilledIcon fontSize="small" style={{ marginRight: "0.3rem" }} />
          {strings.common.history}
        </MenuItem>
      </Menu>
    </div>
  );
};

const rawColumns = [
  // Documentation: https://react-data-table-component.netlify.app/?path=/docs/api-columns--page
  {
    id: "image_column",
    selector: (row) => row.data.imagePath,
    compact: false,
    cell: (row) => (
      <img
        data-tag="allowRowEvents"
        className="project-image"
        src={!_isEmpty(row.data.imagePath) ? webpVersion(row.data.imagePath) : "Default_thumbnail.jpg"}
        alt={row.data.thumbnail}
      />
    )
  },
  {
    id: "project_name_column",
    style: {
      paddingRight: 0
    },
    name: <Typography className="project-column">{strings.common.project_name}</Typography>,
    selector: (row) => row.data.projectName,
    compact: false,
    sortField: "name",
    sortable: true,
    cell: (row) => (
      <Typography data-tag="allowRowEvents" data-test="project-name" className="project-name">
        {trimSpecialChars(row.data.projectName)}
      </Typography>
    )
  },
  {
    id: "project_budgets_column",
    name: <Typography className="project-column">{strings.common.budget}</Typography>,
    sortable: false,
    compact: true,
    cell: (row) => <span data-tag="allowRowEvents">{row.components.Budgets}</span>
  },
  {
    id: "project_status_column",
    name: <Typography className="project-column">{strings.common.status}</Typography>,
    selector: (row) => row.data.projectStatus,
    sortField: "status",
    compact: true,
    sortable: true,
    cell: (row) => (
      <Typography data-tag="allowRowEvents" className="project-status">
        {row.data.projectStatus}
      </Typography>
    )
  },
  {
    id: "project_date_column",
    name: <Typography className="project-column">{strings.common.created}</Typography>,
    selector: (row) => row.data.creationUnixTs, // time in ms to use the built-in sort
    sortField: "date",
    compact: true,
    sortable: true,
    cell: (row) => (
      <Typography data-tag="allowRowEvents" className="project-created-on">
        {row.data.createdDate}
      </Typography>
    ) // formatted date that is shown
  },
  {
    id: "project_assignee_column",
    name: <Typography className="project-column">{strings.common.assignee}</Typography>,
    selector: (row) => row.data.assignee,
    sortField: "assignee",
    sortable: true,
    compact: true,
    cell: (row) => <Typography>{row.data.assignee}</Typography>
  },
  {
    id: "project_tags_column",
    name: <Typography className="project-column">{strings.common.tags}</Typography>,
    compact: true,
    sortable: false,
    cell: (row) => row.components.Tags
  },
  {
    id: "action_buttons_column",
    compact: false,
    sortable: false,
    right: true,
    cell: (row) => row.components.ProjectMenu
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
  const projectRows = projects.map(({ data, allowedIntents }, index) => {
    const {
      displayName,
      id,
      status,
      thumbnail = "Default_thumbnail.jpg",
      creationUnixTs,
      projectedBudgets,
      tags
    } = data;
    const imagePath = !_isEmpty(thumbnail) ? webpVersion(thumbnail) : "Default_thumbnail.jpg";

    const row = {
      data: {
        id: index,
        projectId: id,
        projectName: displayName,
        projectStatus: <StatusChip status={status} />,
        tags: tags || [],
        creationUnixTs: creationUnixTs,
        createdDate: unixTsToString(creationUnixTs),
        imagePath: imagePath
      },
      components: {
        ProjectMenu: (
          <ProjectMenu
            project={data}
            showEditDialog={showEditDialog}
            showProjectPermissions={showProjectPermissions}
            showProjectAdditionalData={showProjectAdditionalData}
            allowedIntents={allowedIntents}
          />
        ),
        Tags: (
          <Box className="project-tags-box">
            {tags?.map((tag) => (
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
        Budgets: <BudgetsList budgets={projectedBudgets} />
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
  const [showAssignee, setShowAssignee] = useState(false);
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
  const navigate = useNavigate();

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
      if (!showAssignee && c.id === "project_assignee_column") {
        return false;
      }
      return true;
    });

    setColumns([...currentColumns]);
  }, [showBudgets, showTags, showAssignee]);

  const FilterDropdown = ({ showTags, setShowTags, showBudgets, setShowBudgets }) => {
    const [selectedOption, setSelectedOption] = useState("");

    const handleSelectChange = (event) => {
      setSelectedOption(event.target.value);
    };
    const theme = useTheme();

    return (
      <div className="filter-dropdown-wrapper">
        <Select
          disableUnderline
          sx={(theme) => ({
            "& .MuiSelect-icon": {
              color: theme.palette.deepDarkBlue,
              fontSize: "1.3rem"
            }
          })}
          value={selectedOption || "filter"}
          onChange={handleSelectChange}
          IconComponent={KeyboardArrowDownIcon}
          startAdornment={
            selectedOption === "" && (
              <InputAdornment position="start">
                <FilterAltIcon
                  sx={(theme) => ({
                    color: theme.palette.deepDarkBlue
                  })}
                />
              </InputAdornment>
            )
          }
          MenuProps={{
            PaperProps: {
              sx: {
                width: "12rem",
                marginTop: 2,
                border: "1px solid",
                borderColor: theme.palette.primaryBlue,
                boxShadow: `2px 4px 6px ${theme.palette.grey.light}`
              }
            },
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left"
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left"
            }
          }}
          renderValue={() => strings.common.filter}
        >
          <MenuItem
            className="filter-menu-item"
            selected={showTags}
            onClick={() => setShowTags(!showTags)}
            value="tags"
          >
            <Box className="menu-item-box">{showTags && <CheckIcon className="check-icon" />}</Box>
            {strings.common.tags}
          </MenuItem>
          <MenuItem
            className="filter-menu-item"
            selected={showBudgets}
            onClick={() => setShowBudgets(!showBudgets)}
            value="budgets"
          >
            <Box className="menu-item-box">{showBudgets && <CheckIcon className="check-icon" />}</Box>
            {strings.common.budgets}
          </MenuItem>
          <MenuItem
            className="filter-menu-item"
            selected={showAssignee}
            onClick={() => setShowAssignee(!showAssignee)}
            value="assignee"
          >
            <Box className="menu-item-box">{showAssignee && <CheckIcon className="check-icon" />}</Box>
            {strings.common.assignee}
          </MenuItem>
        </Select>
      </div>
    );
  };

  const FilterDateDropdown = ({ showTags, setShowTags, showBudgets, setShowBudgets }) => {
    const [selectedOption, setSelectedOption] = useState("");

    const handleSelectChange = (event) => {
      setSelectedOption(event.target.value);
    };
    const theme = useTheme();

    return (
      <div className="filter-date-dropdown-wrapper">
        <Select
          disableUnderline
          sx={(theme) => ({
            "& .MuiSelect-icon": {
              color: theme.palette.deepDarkBlue,
              fontSize: "1.3rem"
            }
          })}
          value={selectedOption || "filter"}
          onChange={handleSelectChange}
          IconComponent={KeyboardArrowDownIcon}
          startAdornment={
            selectedOption === "" && (
              <InputAdornment position="start">
                <CalendarMonthIcon
                  sx={(theme) => ({
                    color: theme.palette.deepDarkBlue,
                    width: "1.2rem",
                    height: "1.2rem"
                  })}
                />
              </InputAdornment>
            )
          }
          MenuProps={{
            PaperProps: {
              sx: {
                width: "12rem",
                marginTop: 2,
                border: "1px solid",
                borderColor: theme.palette.primaryBlue,
                boxShadow: `2px 4px 6px ${theme.palette.grey.light}`
              }
            },
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left"
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left"
            }
          }}
          renderValue={() => strings.common.date_range}
        >
          <MenuItem
            className="filter-menu-item"
            selected={showTags}
            onClick={() => setShowTags(!showTags)}
            value="any date"
          >
            <Box className="menu-item-box">{showTags && <CheckIcon className="check-icon" />}</Box>
            {strings.common.any_date}
          </MenuItem>
          <MenuItem
            className="filter-menu-item"
            selected={showBudgets}
            onClick={() => setShowBudgets(!showBudgets)}
            value="last 30 days"
          >
            <Box className="menu-item-box">{showBudgets && <CheckIcon className="check-icon" />}</Box>
            {strings.common.date_30_days}
          </MenuItem>
          <MenuItem
            className="filter-menu-item"
            selected={showAssignee}
            onClick={() => setShowAssignee(!showAssignee)}
            value="last 6 months"
          >
            <Box className="menu-item-box">{showAssignee && <CheckIcon className="check-icon" />}</Box>
            {strings.common.date_6_months}
          </MenuItem>
          <MenuItem
            className="filter-menu-item"
            selected={showAssignee}
            onClick={() => setShowAssignee(!showAssignee)}
            value="custom"
          >
            <Box className="menu-item-box">{showAssignee && <CheckIcon className="check-icon" />}</Box>
            {strings.common.date_custom}
          </MenuItem>
        </Select>
      </div>
    );
  };

  const actionsMemo = useMemo(
    () => (
      <>
        <Box className="project-actions-box">
          <Box className="project-actions-box-left">
            <Box className="project-actions">
              <Searchbar
                isSearchBarDisplayedByDefault={true}
                searchDisabled={false}
                safeOnChange={true}
                previewText={strings.common.filter_by_search}
                searchTerm={searchTerm}
                storeSearchTerm={(word) => storeSearchTerm(word)}
              />
              <Box className="filter-menu-dropdown">
                <FilterDropdown
                  showTags={showTags}
                  setShowTags={setShowTags}
                  showBudgets={showBudgets}
                  setShowBudgets={setShowBudgets}
                  showAssignee={showAssignee}
                  setShowAssignee={setShowAssignee}
                />
              </Box>
              <Box className="filter-menu-dropdown">
                <FilterDateDropdown />
              </Box>
              <ActionButton
                ariaLabel="show filter"
                onClick={() => setShowFilter(!showFilter)}
                icon={<FilterAltIcon />}
                data-test="open-filter"
              />
            </Box>

            <Box className="filter-menu-box">
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
          <Box className="project-actions-box-right">
            <Fab
              className="project-add-button"
              aria-label="create"
              disabled={!canCreateProject(props.allowedIntents)}
              onClick={() => showCreationDialog()}
              data-test="create-project-button"
            >
              <span className="add-new-project-text">{strings.project.add_new_project}</span>
              <ContentAdd sx={{ width: "1.25rem", height: "1.25rem" }} />
            </Fab>
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
      storeSearchTerm,
      showAssignee,
      props.allowedIntents,
      showCreationDialog
    ]
  );

  const handleRowClick = (row) => navigate(`/projects/${row.data.projectId}`);

  return (
    <>
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
        onRowClicked={handleRowClick}
        data-test="project-list"
        customStyles={customStyles}
      />
    </>
  );
};

export default TableView;
