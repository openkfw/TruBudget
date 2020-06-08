import React, { Component } from "react";

import _isEmpty from "lodash/isEmpty";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

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
  constructor() {
    super();
    this.state = {
      name: ""
    };
  }

  render = () => {
    const { storeWorkflowDocument, workflowDocuments } = this.props;
    return (
      <div>
        <div>
          <DocumentOverview documents={workflowDocuments} validationActive={false} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <TextField
            helperText={strings.workflow.workflow_document_description}
            label={strings.workflow.workflow_document_name}
            value={this.state.name}
            id="documentnameinput"
            onChange={event => this.setState({ name: event.target.value })}
          />
          <Button
            style={styles.uploadButton}
            disabled={
              _isEmpty(this.state.name) || workflowDocuments.filter(doc => doc.id === this.state.name).length > 0
            }
            component="div"
          >
            {strings.workflow.workflow_upload_document}
            {_isEmpty(this.state.name) ? null : (
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
                        storeWorkflowDocument(this.state.name, dataUrl, file.name);
                      }
                      this.setState({ name: "" });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            )}
          </Button>
        </div>
      </div>
    );
  };
}
