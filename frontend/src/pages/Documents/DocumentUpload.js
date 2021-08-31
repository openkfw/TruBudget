import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import UploadIcon from "@material-ui/icons/Publish";

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

export default class DocumentUpload extends Component {
  render = () => {
    const { storeWorkflowDocument, workflowDocuments } = this.props;
    const body = (<TableBody>
      {workflowDocuments.length > 0 ? workflowDocuments.map((document, index) =>
      (
        <TableRow key={`${index}-${document.fileName}`}>
          <TableCell style={{ textAlign: "center", backgroundColor: "#f3f3f3" }} data-test="workflowitemDocumentFileName">
            <Typography variant="body1" >{document.fileName}</Typography>
          </TableCell>
        </TableRow>
      )
      ) : <div style={{ backgroundColor: "#f3f3f3" }}>
        <DocumentEmptyState />
      </div>}
    </TableBody>);
    return (
      <div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <Table style={{ width: "40%" }}>
            {body}
          </Table>
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
          <Button style={styles.uploadButton} component="div">
            <UploadIcon />
            {strings.workflow.workflow_upload_document}
            <input
              id="docupload"
              type="file"
              style={styles.uploadInput}
              onChange={event => {
                if (event.target.files) {
                  const file = event.target.files[0];
                  const reader = new FileReader();
                  reader.onloadend = e => {
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
}
