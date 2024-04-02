import React from "react";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";

import AmountIcon from "@mui/icons-material/AccountBalance";
import DateIcon from "@mui/icons-material/DateRange";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/LabelOutlined";
import PermissionIcon from "@mui/icons-material/LockOpen";
import MoreIcon from "@mui/icons-material/MoreHoriz";
import ViewIcon from "@mui/icons-material/ZoomIn";
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
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";
import { canViewProjectDetails } from "../../permissions";
import ActionButton from "../Common/ActionButton";

const ProjectCard = ({
  index,
  id,
  allowedIntents,
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
  parentStyles,
  imagePath,
  searchTermArray
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card aria-label="project" key={index} style={parentStyles.card} data-test={`project-card-${id}`}>
      <CardMedia style={parentStyles.media} image={imagePath} />
      <CardActions
        style={{
          display: "flex",
          flexDirection: "column",
          height: "20px",
          alignItems: "flex-end",
          marginTop: "-40px"
        }}
      >
        <Tooltip id="tooltip-pview" title={strings.common.view_project_details}>
          <div>
            <Fab
              aria-label="view project"
              style={parentStyles.button}
              disabled={!canViewProjectDetails(allowedIntents)}
              color="primary"
              onClick={() => {
                navigate("/projects/" + id);
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
          style={parentStyles.cardHeader}
          title={
            <div
              style={parentStyles.cardTitle}
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
        <List
          sx={{
            marginTop: "5px",
            height: "200px",
            overflow: "scroll",
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          {projectedBudgets.length === 0 ? null : (
            <ListItem style={parentStyles.listItem}>
              <ListItemIcon>
                <AmountIcon />
              </ListItemIcon>
              <ListItemText data-test="project-budget" primary={budgets} secondary={strings.common.budget} />
            </ListItem>
          )}
          <ListItem style={parentStyles.listItem}>
            <ListItemIcon>
              <DateIcon />
            </ListItemIcon>
            <ListItemText data-test="project-creation-date" primary={dateString} secondary={strings.common.created} />
          </ListItem>
          {displayedTags.length > 0 ? (
            <ListItem style={{ ...parentStyles.listItem, marginTop: "13px" }} data-test="overview-taglist">
              <ListItemIcon>
                <LabelIcon />
              </ListItemIcon>
              <ListItemText data-test="overview-tags" primary="" secondary={displayedTags} />
            </ListItem>
          ) : null}

          <ListItem style={parentStyles.editContainer}>
            <ActionButton
              ariaLabel="show project"
              notVisible={additionalDataEmpty}
              onClick={() => {
                showProjectAdditionalData(id);
              }}
              title="Additional Data"
              icon={<MoreIcon />}
              data-test={`project-overview-additionaldata-${id}`}
            />
            <ActionButton
              ariaLabel="show project permissions"
              notVisible={!canViewPermissions}
              onClick={() => showProjectPermissions(id, displayName)}
              title={strings.common.show_permissions}
              icon={<PermissionIcon />}
              data-test={`pp-button-${index}`}
              className="edit-icon"
            />
            <ActionButton
              ariaLabel="show edit dialog"
              notVisible={!isOpen || editDisabled}
              onClick={() => {
                showEditDialog(id, displayName, description, thumbnail, projectedBudgets, tags);
              }}
              title={strings.common.edit}
              icon={<EditIcon />}
              id={`pe-button-${index}`}
              data-test={`pe-button`}
              className="edit-icon"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
