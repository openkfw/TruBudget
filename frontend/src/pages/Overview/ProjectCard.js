import { withStyles, withTheme } from "@mui/styles";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import AmountIcon from "@mui/icons-material/AccountBalance";
import DateIcon from "@mui/icons-material/DateRange";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/LabelOutlined";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import ViewIcon from "@mui/icons-material/ZoomIn";
import React from "react";
import Highlighter from "react-highlight-words";
import strings from "../../localizeStrings";
import { canViewProjectDetails } from "../../permissions";
import ActionButton from "../Common/ActionButton";

const styles = {
  editIcon: {
    color: "black"
  }
};

const ProjectCard = ({
  index,
  id,
  allowedIntents,
  history,
  displayName,
  mappedStatus,
  projectedBudgets,
  budgets,
  displayedTags,
  dateString,
  showProjectAdditionalData,
  additionalDataEmpty,
  canViewPermissions,
  isOpen,
  showProjectPermissions,
  editDisabled,
  showEditDialog,
  description,
  thumbnail,
  tags,
  parentClasses,
  imagePath,
  searchTermArray,
  theme
}) => {
  return (
    <Card aria-label="project" key={index} className={parentClasses.card} data-test={`project-card-${id}`}>
      <CardMedia className={parentClasses.media} image={imagePath} />
      <CardActions
        style={{
          display: "flex",
          flexDirection: "column",
          height: "20px",
          alignItems: "flex-end",
          marginTop: "-40px"
        }}
      >
        <Tooltip id="tooltip-pview" title={strings.common.view}>
          <div>
            <Fab
              className={parentClasses.button}
              disabled={!canViewProjectDetails(allowedIntents)}
              color="primary"
              onClick={() => {
                history.push("/projects/" + id);
              }}
              data-test={`project-view-button-${index}`}
            >
              <ViewIcon />
            </Fab>
          </div>
        </Tooltip>
      </CardActions>
      <CardContent>
        <CardHeader
          data-test="project-header"
          className={parentClasses.cardHeader}
          title={
            <div
              className={parentClasses.cardTitle}
              id={`project-title-${index}`}
              data-test={`project-title-${displayName}`}
            >
              <Highlighter
                highlightStyle={{ backgroundColor: theme.palette.primary.light }}
                searchWords={searchTermArray}
                textToHighlight={displayName}
              />
            </div>
          }
          subheader={
            <Highlighter
              data-test={`project-status-${mappedStatus}`}
              highlightStyle={{ backgroundColor: theme.palette.primary.light }}
              searchWords={searchTermArray}
              textToHighlight={mappedStatus}
            />
          }
        />
        <List>
          <div
            style={{ marginTop: "5px", height: "200px", overflow: "scroll", overflowY: "auto", overflowX: "hidden" }}
          >
            {projectedBudgets.length === 0 ? null : (
              <ListItem className={parentClasses.listItem} disabled={false}>
                <ListItemIcon>
                  <AmountIcon />
                </ListItemIcon>
                <ListItemText data-test="project-budget" primary={budgets} secondary={strings.common.budget} />
              </ListItem>
            )}
            <ListItem className={parentClasses.listItem} disabled={false}>
              <ListItemIcon>
                <DateIcon />
              </ListItemIcon>
              <ListItemText data-test="project-creation-date" primary={dateString} secondary={strings.common.created} />
            </ListItem>
            {displayedTags.length > 0 ? (
              <ListItem
                style={{ marginTop: "13px" }}
                className={parentClasses.listItem}
                data-test="overview-taglist"
                disabled={false}
              >
                <ListItemIcon>
                  <LabelIcon />
                </ListItemIcon>
                <ListItemText data-test="overview-tags" primary="" secondary={displayedTags} />
              </ListItem>
            ) : null}
          </div>
          <div className={parentClasses.editContainer}>
            <ActionButton
              notVisible={additionalDataEmpty}
              onClick={() => {
                showProjectAdditionalData(id);
              }}
              title="Additional Data"
              icon={<MoreIcon />}
              data-test={`project-overview-additionaldata-${index}`}
            />
            <ActionButton
              notVisible={!canViewPermissions}
              onClick={() => showProjectPermissions(id, displayName)}
              title={strings.common.show_permissions}
              icon={<PermissionIcon />}
              data-test={`pp-button-${index}`}
              iconButtonStyle={styles.editIcon}
            />
            <ActionButton
              notVisible={!isOpen || editDisabled}
              onClick={() => {
                showEditDialog(id, displayName, description, thumbnail, projectedBudgets, tags);
              }}
              title={strings.common.edit}
              icon={<EditIcon />}
              id={`pe-button-${index}`}
              data-test={`pe-button`}
              iconButtonStyle={styles.editIcon}
            />
          </div>
        </List>
      </CardContent>
    </Card>
  );
};

export default withTheme(withStyles(styles)(ProjectCard));
