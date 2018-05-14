import React, { Component } from "react";
import _ from "lodash";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";

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
    return (
      <div>
        <div>
          <DocumentOverview documents={this.props.workflowDocuments} validationActive={false} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <TextField
            helperText={strings.workflow.workflow_document_description}
            label={strings.workflow.workflow_document_name}
            value={this.state.name}
            onChange={event => this.setState({ name: event.target.value })}
          />
          <Button style={styles.uploadButton} disabled={_.isEmpty(this.state.name)}>
            {strings.workflow.workflow_upload_document}
            {_.isEmpty(this.state.name) ? null : (
              <input
                id="docupload"
                type="file"
                ref={input => (this.input = input)}
                style={styles.uploadInput}
                onChange={() => {
                  const file = this.input.files[0];
                  this.props.addDocument(file, this.state.name, Date.now());
                  this.setState({ name: "" });
                }}
              />
            )}
          </Button>
        </div>
      </div>
    );
  };
}
