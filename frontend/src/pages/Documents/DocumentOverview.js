import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
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
      style = styles.uploadButton;
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
      style = {
        ...styles.uploadButton
      };
    } else {
      label = strings.workflow.workflow_document_changed + "!";
      style = {
        ...styles.uploadButton
      };
    }

    return { style, label };
  };

  generateUploadIcon = (hash, validated) => (
    <Button labelPosition="before" containerElement="label" {...this.getPropsForUploadButton(validated)}>
      <input
        id="docvalidation"
        type="file"
        ref={input => (this.input[hash] = input)}
        style={styles.uploadInput}
        onChange={() => {
          const file = this.input[hash].files[0];
          this.props.validateDocument(hash, file);
        }}
      />
    </Button>
  );

  generateHashIcon = hash => (
    <Button
      labelPosition="after"
      style={styles.hashButton}
      disableTouchRipple={true}
      hoverColor="none"
      icon={<FingerPrint />}
    >
      {`${hash.slice(0, 6)}...`}
    </Button>
  );

  generateDocumentList = (documents, validationActive = true, validatedDocuments = {}) =>
    documents.map((document, index) => {
      let validated = undefined;
      const { displayName, payload } = document;

      //if (validationActive) validated = validatedDocuments[hash];
      //{hash ? this.generateHashIcon(hash) : <CircularProgress size={20} />}
      //{validationActive ? <TableCell>{this.generateUploadIcon(hash, validated)}</TableCell> : null}
      return (
        <TableRow key={index + "document"}>
          <TableCell style={{ textAlign: "center" }}>

          </TableCell>
          <TableCell>{displayName}</TableCell>

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
    console.log(this.props);
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
