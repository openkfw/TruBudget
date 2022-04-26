import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import BudgetsList from "./BudgetsList";
import { styled } from "@mui/material/styles";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import DateIcon from "@mui/icons-material/DateRange";
import AssigneeIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import PermissionIcon from "@mui/icons-material/LockOpen";
import LaunchIcon from "@mui/icons-material/ZoomIn";
import strings from "../../localizeStrings";
import { statusIconMapping, statusMapping, unixTsToString } from "../../helper.js";
import SelectablePill from "../Common/SelectablePill";
import ActionButton from "../Common/ActionButton";
import { canUpdateProject, canViewProjectPermissions, canViewProjectDetails } from "../../permissions";

const Accordion = styled(props => <MuiAccordion disableGutters elevation={0} {...props} />)(({ theme }) => ({
  "&:not(:first-of-type)": {
    borderStyle: "solid",
    borderWidth: "2px 0px 0px 0px",
    borderColor: ` ${theme.palette.divider}`
  },
  "&:not(:last-child)": {
    borderBottom: 0
  },
  "&:before": {
    display: "none"
  },
  "& .MuiBox-root": {
    cursor: "auto"
  }
}));

export default function ProjectAccordion(props) {
  const {
    project,
    allowedIntents,
    history,
    users = [],
    showSearchBar,
    storeSearchTerm,
    searchTermArray,
    showProjectPermissions,
    showEditDialog
  } = props;
  // const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const dateString = unixTsToString(project.creationUnixTs);
  const owner = users.find(u => u.id === project.assignee);
  const mappedStatus = statusMapping(project.status);
  const statusIcon = statusIconMapping[project.status];
  // const isUserAllowedToAssign = canAssignProject(allowedIntents);

  const isOpen = project.status === "open";
  const canViewPermissions = canViewProjectPermissions(allowedIntents);
  const editDisabled = !(canUpdateProject(allowedIntents) && isOpen);
  const viewDisabled = !canViewProjectDetails(allowedIntents);

  // const handleClick = () => {
  //   history.push("/projects/" + project.id);
  //   setExpanded(true);
  // };

  return (
    <>
      <Accordion expanded={false} sx={{ maxWidth: "150rem" }}>
        <MuiAccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", minHeight: "150px" }}>
            <Box sx={{ width: "25%" }}>
              <Typography>{project.displayName}</Typography>
              <Typography sx={{ color: theme.palette.grey.dark }}>{project.description}</Typography>
            </Box>

            <Box sx={{ width: "25%" }}>
              <Box sx={{ display: "flex", alignItems: "center", columnGap: "10px" }}>
                <Avatar>
                  <DateIcon />
                </Avatar>
                <Box>
                  <Typography>{dateString}</Typography>
                  <Typography sx={{ color: theme.palette.grey.dark }}>{strings.common.created}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", columnGap: "10px", marginTop: "20px" }}>
                <Avatar>{statusIcon}</Avatar>
                <Box>
                  <Typography>{mappedStatus}</Typography>
                  <Typography sx={{ color: theme.palette.grey.dark }}>{strings.common.status}</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ width: "25%" }}>
              <Box sx={{ display: "flex", alignItems: "center", columnGap: "10px" }}>
                <Avatar>
                  <AssigneeIcon />
                </Avatar>
                <Box>
                  <Typography>{owner.displayName}</Typography>
                  <Typography sx={{ color: theme.palette.grey.dark }}>{strings.project.assignee}</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: "20px" }}>
                {project.tags.map(tag => (
                  <SelectablePill
                    key={tag}
                    onClick={() => {
                      showSearchBar();
                      storeSearchTerm(`tag:${tag}`);
                    }}
                    //Should be fixed by better fucntion:
                    isSelected={searchTermArray?.includes(tag) || false}
                  >
                    {tag}
                  </SelectablePill>
                ))}
              </Box>
            </Box>

            <Box sx={{ width: "25%" }}>
              <BudgetsList budgets={project.projectedBudgets} />
            </Box>

            <Box>
              <ActionButton
                notVisible={viewDisabled}
                onClick={() => {
                  history.push("/projects/" + project.id);
                }}
                title={strings.common.view}
                alignTooltip="left"
                icon={<LaunchIcon />}
                data-test={`project-view-${project.id}`}
              />
              <ActionButton
                notVisible={!canViewPermissions}
                onClick={() => showProjectPermissions(project.id, project.displayName)}
                title={strings.common.show_permissions}
                alignTooltip="left"
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
                alignTooltip="left"
                icon={<EditIcon />}
                data-test={`project-edit-${project.id}`}
              />
            </Box>
          </Box>
        </MuiAccordionSummary>
        {/*
        // ToDo Add own API point to show specific Details in open accordion
        <AccordionDetails>
          <Box>
            <Typography sx={{}}>{project.description}</Typography>
          </Box>
        </AccordionDetails> */}
      </Accordion>
    </>
  );
}
