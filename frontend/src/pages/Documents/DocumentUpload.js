import React from "react";

import UploadIcon from "@mui/icons-material/Publish";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import { DocumentEmptyState } from "./DocumentEmptyStates";

const styles = {
  uploadButton: {
    verticalAlign: "middle"
  },
  uploadInput: {
    cursor: "pointer",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: "100%",
    opacity: 0
  }
};

const DocumentUpload = (props) => {
  const { storeWorkflowDocument, workflowDocuments } = props;

  const body = (
    <TableBody>
      {workflowDocuments.length > 0 ? (
        workflowDocuments.map((document, index) => (
          <TableRow key={`${index}-${document.fileName}`}>
            <TableCell
              style={{ textAlign: "center", backgroundColor: "#f3f3f3" }}
              data-test="workflowitemDocumentFileName"
            >
              <Typography variant="body1">{document.fileName}</Typography>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell style={{ backgroundColor: "#f3f3f3" }}>
            <DocumentEmptyState />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        <Table style={{ width: "40%" }}>{body}</Table>
      </div>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
        <Button style={styles.uploadButton} component="div">
          <UploadIcon />
          {strings.workflow.workflow_upload_document}
          <input
            id="docupload"
            type="file"
            style={styles.uploadInput}
            onChange={(event) => {
              if (event.target.files) {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onloadend = (e) => {
                  if (e.target.result !== undefined) {
                    const dataUrl = e.target.result.split(";base64,")[1];
                    storeWorkflowDocument(dataUrl, file.name);
                  }
                };
                if (file) {
                  reader.readAsDataURL(file);
                }
              }
            }}
          />
        </Button>
      </div>
    </div>
  );
};
export default DocumentUpload;
