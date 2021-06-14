import React, { Component } from "react";
import Button from "@material-ui/core/Button";

import DocumentOverview from "./DocumentOverview";
import strings from "../../localizeStrings";

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
    return (
      <div>
        <div>
          <DocumentOverview documents={workflowDocuments} validationActive={false} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <Button
            style={styles.uploadButton}
            component="div"
          >
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
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>
        </div>
      </div>
    );
  };
}
