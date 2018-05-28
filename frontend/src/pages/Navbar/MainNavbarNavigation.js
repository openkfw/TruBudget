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
    alignItems: "flex-start"
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
    case "network":
      return strings.navigation.menu_item_network;
    default:
      break;
  }
};

// const getPathName = (name, streamNames) => {
//   const breadcrumb = streamNames[name] ? streamNames[name] : getStaticBreadcrumb(name);
//   return breadcrumb ? breadcrumb : '...';
// };

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
  let paths = pathname.trim().split("/");
  if (paths.length < 2 || !paths[1]) return null;

  const accumulatedPath = paths.map((path, index, source) => {
    return index ? "/" + source.slice(1, index + 1).join("/") : "/";
  });
  return paths.map((path, index) => {
    const isLastItem = index === paths.length - 1;
    return (
      <div key={index} style={styles.breadcrumb}>
        <div>{index ? <ChevronRight color="primary" style={{ height: "16px" }} /> : null}</div>
        <Button disabled={isLastItem} color="primary" onClick={() => history.push(accumulatedPath[index])}>
          {index ? getPathName(path, index, currentProject, currentSubProject) : strings.navigation.main_site}
        </Button>
      </div>
    );
  });
};

const MainNavbarNavigation = ({
  onToggleSidebar,
  history,
  route,
  productionActive,
  currentProject,
  currentSubProject
}) => {
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
