import React from "react";

import { CardContent } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

let noDocsText = ["Click on the upload button and select a document", "Add an optional comment", ""];

const DocumentEmptyState = (props) => {
  const { captionText } = props;
  return (
    <CardContent>
      <List>
        <ListItem>
          <img
            src="/images-for-empty-state/workflow-items-empty-state.png"
            alt={strings.common.no_documents}
            width="150vw"
          />
        </ListItem>
        <ListItem>
          <Typography variant="subtitle1" className="subtitle">
            {strings.common.no_documents}
          </Typography>
        </ListItem>
        <ListItem>
          <Typography variant="caption" className="caption">
            {captionText ? captionText : strings.common.no_documents_upload_text}
          </Typography>
        </ListItem>
      </List>
    </CardContent>
  );
};

export { DocumentEmptyState };
