import { withStyles, withTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Tooltip from "@material-ui/core/Tooltip";
import AmountIcon from "@material-ui/icons/AccountBalance";
import DateIcon from "@material-ui/icons/DateRange";
import EditIcon from "@material-ui/icons/Edit";
import LabelIcon from "@material-ui/icons/LabelOutlined";
import PermissionIcon from "@material-ui/icons/LockOpen";
import MoreIcon from "@material-ui/icons/MoreHoriz";
import ViewIcon from "@material-ui/icons/ZoomIn";
import React from "react";
import Highlight from "react-highlighter";
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
  highlightingRegex,
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
            <div className={parentClasses.cardTitle} id={`project-title-${index}`} data-test={`project-title`}>
              <Highlight matchStyle={{ backgroundColor: theme.palette.primary.light }} search={highlightingRegex}>
                {displayName}
              </Highlight>
            </div>
          }
          subheader={
            <Highlight matchStyle={{ backgroundColor: theme.palette.primary.light }} search={highlightingRegex}>
              {mappedStatus}
            </Highlight>
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
