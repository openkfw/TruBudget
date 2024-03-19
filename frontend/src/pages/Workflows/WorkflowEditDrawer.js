import React, { useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";
import { workflowItemIntentOrder } from "../../permissions";
import PermissionTable from "../Common/Permissions/PermissionsTable";
import SingleSelection from "../Common/SingleSelection";

const styles = {
  assigneeCard: {
    marginTop: "12px",
    marginBottom: "12px"
  },
  selectedWorkflowItemsDisplay: {
    paddingTop: "36px",
    align: "center",
    textAlign: "center"
  },
  infoContainer: {
    margin: "24px 36px 0px 36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "500px"
  },
  assigneeContainer: {
    padding: "32px"
  },
  spaceBox: {
    margin: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
};

const getDefaultPermissions = () => {
  const permissions = workflowItemIntentOrder.reduce((acc, next) => {
    next.intents.map((intent) => (acc[intent] = []));
    return acc;
  }, {});
  return permissions;
};

const WorkflowEditDrawer = (props) => {
  const {
    selectedWorkflowItems,
    showWorkflowItemPreview,
    storePermissions,
    users,
    groups,
    createWorkflowItem,
    disableWorkflowEdit,
    fetchAllProjects,
    fetchAllProjectDetailsNotCurrentProject,
    loadedProjectDetails,
    tempDrawerAssignee,
    tempDrawerPermissions,
    storeAssignee,
    projects,
    projectId,
    subprojectId,
    myself,
    subprojectValidator,
    storeWorkflowItemsBulkAction,
    hasSubprojectValidator,
    workflowitemsBulkAction
  } = props;

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSubprojectId, setSelectedSubprojectId] = useState("");
  const [selectedSubproject, setSelectedSubproject] = useState(null);
  const permissions = _isEmpty(tempDrawerPermissions) ? getDefaultPermissions() : tempDrawerPermissions;

  useEffect(() => {
    fetchAllProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectSelectionChange = (e) => {
    const projectId = e.target.value;
    fetchAllProjectDetailsNotCurrentProject(projectId, true);
    setSelectedProjectId(projectId);
    setSelectedSubproject("");
  };

  const assign = (assignee) => {
    storeAssignee(assignee);
  };

  const grantPermission = (intent, user) => {
    if (!permissions[intent].includes(user)) {
      permissions[intent].push(user);
    }
    storePermissions(permissions);
  };

  const revokePermission = (intent, user) => {
    if (permissions[intent].includes(user)) {
      permissions[intent].splice(permissions[intent].indexOf(user), 1);
    }
    storePermissions(permissions);
  };

  const handleSubprojectSelectChange = (e) => {
    const subProjectId = e.target.value;
    setSelectedSubprojectId(subProjectId);
    setSelectedSubproject(subProjectId);
  };

  const handleCancelDrawer = () => {
    // disableWorkflowEdit();
    storeWorkflowItemsBulkAction("");
  };

  const handleCopySubmit = () => {
    selectedWorkflowItems.forEach((workflowItem) => {
      const { amount, amountType, assignee, currency, displayName, exchangeRate, description, workflowitemType } =
        workflowItem.data;
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      createWorkflowItem(
        selectedProjectId,
        selectedSubprojectId,
        displayName,
        amount || 1, // amount,
        exchangeRate || "1.0", // exchangeRate,
        amountType,
        currency || "EUR", // currency,
        description,
        "open", // status
        [], // documents
        nextYear.toISOString(), // dueDate
        workflowitemType,
        projects.find((p) => p.data.id === selectedProjectId).data?.displayName || "", // projectDisplayName,
        loadedProjectDetails?.subprojects?.find((sp) => sp.data.id === selectedSubprojectId).data?.displayName, // subprojectDisplayName,
        assignee,
        assignee, // assigneeDisplayName,
        []
      );
    });

    disableWorkflowEdit();
    storeWorkflowItemsBulkAction("");
  };

  const isOpen = !_isEmpty(selectedWorkflowItems) && workflowitemsBulkAction !== "";
  const usersAndGroups = [...users, ...groups];

  // Only render the drawer if there are elements selected
  if (!isOpen) return null;

  const renderContent = () => {
    if (workflowitemsBulkAction === "permissions") {
      return (
        <>
          <Typography style={styles.infoContainer} color="primary" variant="subtitle1">
            {strings.formatString(strings.workflow.workflow_selection, selectedWorkflowItems.length)}
          </Typography>
          <Typography style={styles.infoContainer} color="error" variant="subtitle1">
            {strings.preview.overwrite_warning}
          </Typography>
          <div>
            <Card style={styles.assigneeCard}>
              <CardHeader subheader="Assignee" />
              <CardContent style={styles.assigneeContainer}>
                <SingleSelection
                  disabled={hasSubprojectValidator}
                  selectId={hasSubprojectValidator ? subprojectValidator : tempDrawerAssignee}
                  selectableItems={users}
                  onSelect={assign}
                />
              </CardContent>
            </Card>
            <PermissionTable
              permissions={permissions}
              intentOrder={workflowItemIntentOrder}
              userList={usersAndGroups}
              addTemporaryPermission={grantPermission}
              removeTemporaryPermission={revokePermission}
              temporaryPermissions={permissions}
              myself={myself}
            />
          </div>
        </>
      );
    } else if (workflowitemsBulkAction === "copy") {
      return (
        <>
          <Typography style={styles.infoContainer} color="primary" variant="subtitle1">
            {strings.formatString(strings.workflow.workflow_selection, selectedWorkflowItems.length)}
          </Typography>
          <Typography style={styles.infoContainer} color="primary" variant="subtitle1">
            This functionality allows you to copy all selected workflow items to the destination subproject including
            amounts and assigned persons. Copied workflow items will be in open status so can edit them afterwards.
          </Typography>
          <div>
            <Card style={styles.assigneeCard}>
              <CardHeader subheader="" />
              <CardContent style={styles.assigneeContainer}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Select project</InputLabel>
                  <Select label="Select project" defaultValue="" onChange={handleProjectSelectionChange}>
                    {projects.map((project) => (
                      <MenuItem key={project.data.id} value={project.data.id}>
                        {project.data.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Select subproject</InputLabel>
                  <Select label="Select subproject" defaultValue="" onChange={handleSubprojectSelectChange}>
                    {loadedProjectDetails?.subprojects?.map((subproject) => (
                      <MenuItem key={subproject.data.id} value={subproject.data.id}>
                        {subproject.data.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={handleCopySubmit}
                  disabled={!selectedSubproject || selectedSubproject === ""}
                >
                  Copy
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  };

  return (
    <Drawer open={isOpen} variant="persistent" anchor="right">
      <Box sx={styles.spaceBox}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            return showWorkflowItemPreview(
              projectId,
              subprojectId,
              selectedWorkflowItems,
              tempDrawerAssignee,
              tempDrawerPermissions
            );
          }}
          disabled={_isEmpty(tempDrawerAssignee) && _isEmpty(tempDrawerPermissions)}
        >
          {strings.preview.overwrite}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleCancelDrawer}>
          {strings.common.cancel}
        </Button>
      </Box>
      {renderContent()}
    </Drawer>
  );
};

export default WorkflowEditDrawer;
