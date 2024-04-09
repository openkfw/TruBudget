import React from "react";

import { CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import "./WorkflowEmptyState.scss";

const WorkflowEmptyState = () => {
  return (
    <CardContent className="workflow-empty-state">
      <img
        src="/images-for-empty-state/workflow-items-empty-state.png"
        alt={strings.common.no_workflow_items}
        width="505vw"
      />
      <Typography variant="subtitle1" className="subtitle">
        {strings.common.no_workflow_items}
      </Typography>
      <Typography variant="caption" className="caption">
        {strings.common.no_items_text}
      </Typography>
    </CardContent>
  );
};

export default WorkflowEmptyState;
