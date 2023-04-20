import React from "react";

import { CardContent } from "@mui/material";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

const styles = {
  subtitle: {
    color: (theme) => theme.palette.grey.dark
  },
  caption: {
    color: (theme) => theme.palette.grey.main
  }
};

const WorkflowEmptyState = (props) => {
  return (
    <CardContent style={{ textAlign: "center" }}>
      <List>
        <img
          src="/images-for-empty-state/workflow-items-empty-state.png"
          alt={strings.common.no_workflow_items}
          width="505vw"
        />
        <Typography variant="subtitle1" style={styles.subtitle}>
          {strings.common.no_workflow_items}
        </Typography>
        <Typography variant="caption" style={styles.caption}>
          {strings.common.no_items_text}
        </Typography>
      </List>
    </CardContent>
  );
};

export default WorkflowEmptyState;
