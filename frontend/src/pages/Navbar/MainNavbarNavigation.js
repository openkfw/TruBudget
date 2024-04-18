import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

import ChevronRight from "@mui/icons-material/ChevronRight";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import { storeSearchBarDisplayed, storeSearchTerm } from "./actions";

import "./MainNavbarNavigation.scss";

const getStaticBreadcrumb = (name) => {
  switch (name) {
    case "projects":
      return strings.navigation.menu_item_projects;
    case "notifications":
      return strings.navigation.menu_item_notifications;
    case "users":
      return strings.users.users;
    case "network":
      return strings.navigation.menu_item_network;
    case "nodes":
      return strings.nodesDashboard.nodes;
    default:
      break;
  }
};

const short = (text, size = 12) =>
  text.length > size
    ? `${text.slice(0, Math.floor(size / 2))}...${text.slice(text.length - Math.floor(size / 2), text.length)}`
    : text;

const getPathName = (name, index, currentProject, currentSubProject) => {
  const staticName = getStaticBreadcrumb(name);
  if (!staticName) {
    switch (index) {
      case 2:
        return short(currentProject);
      case 3:
        return short(currentSubProject);
      default:
        return "...";
    }
  } else {
    return short(staticName);
  }
};

const createBreadcrumb = (
  { pathname },
  navigate,
  currentProject,
  currentSubProject,
  storeSearchTerm,
  storeSearchBarDisplayed
) => {
  //if currentProject or currentSubProject are null the user has no permission to see the displayName
  //null will be displayed as an empty string
  if (!currentProject) currentProject = "";
  if (!currentSubProject) currentSubProject = "";
  let paths = pathname.trim().split("/");
  if (paths.length < 2 || !paths[1]) return null;

  const redacted = strings.common.redacted;

  const accumulatedPath = paths.map((_path, index, source) => {
    return index ? "/" + source.slice(1, index + 1).join("/") : "/";
  });
  return paths.map((path, index) => {
    const pathName = getPathName(path, index, currentProject, currentSubProject);
    const formattedPathName = pathName === "" ? redacted : pathName;
    const isLastItem = index === paths.length - 1;
    const displayedName = index ? formattedPathName : strings.navigation.main_site;
    return (
      <div key={index} className="breadcrumb">
        <div>{index ? <ChevronRight color="primary" className="breadcrumb" /> : null}</div>
        <Button
          disabled={isLastItem || pathName === ""}
          data-test={`breadcrumb-${displayedName}`}
          color="primary"
          onClick={() => {
            storeSearchBarDisplayed(false);
            storeSearchTerm("");
            navigate(accumulatedPath[index]);
          }}
        >
          {displayedName}
        </Button>
      </div>
    );
  });
};

const MainNavbarNavigation = ({
  route,
  currentProject,
  currentSubProject,
  storeSearchTerm,
  storeSearchBarDisplayed
}) => {
  const navigate = useNavigate();
  return (
    <div className="main-navbar-container">
      <Typography variant="button" color={"primary"}>
        {strings.login.frontend_name}
      </Typography>
      <div className="breadcrumbs">
        {createBreadcrumb(route, navigate, currentProject, currentSubProject, storeSearchTerm, storeSearchBarDisplayed)}
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    storeSearchBarDisplayed: (searchBarDisplayed) => dispatch(storeSearchBarDisplayed(searchBarDisplayed)),
    storeSearchTerm: (searchTerm) => dispatch(storeSearchTerm(searchTerm))
  };
};

const mapStateToProps = (state) => {
  return {
    currentProject: state.getIn(["navbar", "currentProject"]),
    currentSubProject: state.getIn(["navbar", "currentSubProject"]),
    route: state.getIn(["route", "locationBeforeTransitions"]),
    searchBarDisplayed: state.getIn(["navbar", "searchBarDisplayed"]),
    searchTerm: state.getIn(["navbar", "searchTerm"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainNavbarNavigation);
