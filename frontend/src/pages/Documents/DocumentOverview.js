import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import FingerPrint from "@material-ui/icons/Fingerprint";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

import _isUndefined from "lodash/isUndefined";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
const styles = {
  uploadButton: {
    verticalAlign: "middle"
  },
  uploadButtonValidated: {
    "background-color": "green"
  },
  uploadButtonChanged: {
    "background-color": "red"
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
  },
  hashButton: {
    cursor: "default"
  }
};

class DocumentOverview extends Component {
  constructor() {
    super();
    this.input = {};
  }
  getPropsForUploadButton = validated => {
    let style = null;
    let label = null;

    if (_isUndefined(validated)) {
      label = strings.workflow.workflow_document_validate;
      style = { ...styles.uploadButton };
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
      style = {
        ...styles.uploadButtonValidated
      };
    } else {
      label = strings.workflow.workflow_document_changed + "!";
      style = {
        ...styles.uploadButtonChanged
      };
    }

    return { style, label };
  };

  generateUploadIcon = (hash, validated) => (
    <Button {...this.getPropsForUploadButton(validated)}>
      Validate
      <input
        id="docvalidation"
        type="file"
        ref={input => (this.input[hash] = input)}
        style={styles.uploadInput}
        onChange={() => {
          const file = this.input[hash].files[0];
          const reader = new FileReader();
          reader.onloadend = e => {
            if (e.target.result !== undefined) {
              //TODO: make own function to convert file into base64String
              const dataUrl = e.target.result.split("base64,")[1];
              this.props.validateDocument(hash, dataUrl);
            }
          };
          reader.readAsDataURL(file);
        }}
      />
    </Button>
  );

  generateHashIcon = hash => (
    <Button style={styles.hashButton} disableTouchRipple={true} icon={<FingerPrint />}>
      {`${hash.slice(0, 6)}...`}
    </Button>
  );

  generateDocumentList = (documents, validationActive = false, validatedDocuments = {}) =>
    documents.map((document, index) => {
      let validated = undefined;
      const { displayName, hash } = document;
      if (validationActive) {
        validated = validatedDocuments[hash];
      }
      return (
        <TableRow key={index + "document"}>
          <TableCell style={{ textAlign: "center" }} />
          <TableCell>{displayName}</TableCell>
          {validationActive ? <TableCell>{this.generateHashIcon(hash)}</TableCell> : null}
          {validationActive ? <TableCell>{this.generateUploadIcon(hash, validated)}</TableCell> : null}
        </TableRow>
      );
    });

  generateEmptyList = () => (
    <TableRow>
      <TableCell>{strings.workflow.workflow_no_documents}</TableCell>
    </TableRow>
  );

  render = () => {
    const { documents, validationActive, validatedDocuments } = this.props;
    return (
      <Table style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        <TableBody>
          {_isEmpty(documents)
            ? this.generateEmptyList()
            : this.generateDocumentList(documents, validationActive, validatedDocuments)}
        </TableBody>
      </Table>
    );
  };
}

export default DocumentOverview;
