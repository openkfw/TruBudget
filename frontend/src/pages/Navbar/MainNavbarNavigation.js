import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ChevronRight from "@mui/icons-material/ChevronRight";
import React from "react";

import strings from "../../localizeStrings";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "12px",
    paddingRight: "12px",
    whiteSpace: "nowrap"
  },
  breadcrumbs: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: "12px"
  },
  breadcrumb: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

const getStaticBreadcrumb = name => {
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
  history,
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

  const accumulatedPath = paths.map((path, index, source) => {
    return index ? "/" + source.slice(1, index + 1).join("/") : "/";
  });
  return paths.map((path, index) => {
    const pathName = getPathName(path, index, currentProject, currentSubProject);
    const formattedPathName = pathName === "" ? redacted : pathName;
    const isLastItem = index === paths.length - 1;
    const displayedName = index ? formattedPathName : strings.navigation.main_site;
    return (
      <div key={index} style={styles.breadcrumb}>
        <div>{index ? <ChevronRight color="primary" style={{ height: "16px" }} /> : null}</div>
        <Button
          disabled={isLastItem || pathName === ""}
          data-test={`breadcrumb-${displayedName}`}
          color="primary"
          onClick={() => {
            storeSearchBarDisplayed(false);
            storeSearchTerm("");
            history.push(accumulatedPath[index]);
          }}
        >
          {displayedName}
        </Button>
      </div>
    );
  });
};

const MainNavbarNavigation = ({
  history,
  route,
  currentProject,
  currentSubProject,
  storeSearchTerm,
  storeSearchBarDisplayed
}) => {

  return (
    <div style={styles.container}>
      <Typography variant="button" color={ "primary" }>
        {strings.login.frontend_name}
      </Typography>
      <div style={styles.breadcrumbs}>
        {createBreadcrumb(route, history, currentProject, currentSubProject, storeSearchTerm, storeSearchBarDisplayed)}
      </div>
    </div>
  );
};

export default MainNavbarNavigation;
