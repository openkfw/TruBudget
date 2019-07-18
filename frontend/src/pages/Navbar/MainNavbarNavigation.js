import React from "react";

import Button from "@material-ui/core/Button";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Typography from "@material-ui/core/Typography";

import strings from "../../localizeStrings";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "12px",
    paddingRight: "12px"
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

const createBreadcrumb = ({ pathname }, history, currentProject, currentSubProject) => {
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
    return (
      <div key={index} style={styles.breadcrumb}>
        <div>{index ? <ChevronRight color="primary" style={{ height: "16px" }} /> : null}</div>
        <Button
          disabled={isLastItem || pathName === ""}
          color="primary"
          onClick={() => history.push(accumulatedPath[index])}
        >
          {index ? formattedPathName : strings.navigation.main_site}
        </Button>
      </div>
    );
  });
};

const MainNavbarNavigation = ({ toggleSidebar, history, route, environment, currentProject, currentSubProject }) => {
  const productionActive = environment === "Prod";
  const navbarTitle = productionActive ? "TruBudget" : "TruBudget (Test)";
  return (
    <div style={styles.container}>
      <Typography variant="button" color={productionActive ? "primary" : "secondary"}>
        {navbarTitle}
      </Typography>
      <div style={styles.breadcrumbs}>{createBreadcrumb(route, history, currentProject, currentSubProject)}</div>
    </div>
  );
};

export default MainNavbarNavigation;
