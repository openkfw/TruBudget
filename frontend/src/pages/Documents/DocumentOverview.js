import React, { Component } from "react";
import Button from "material-ui/Button";
import FingerPrint from "@material-ui/icons/Fingerprint";
import { CircularProgress } from "material-ui/Progress";

import { Table, TableBody, TableRow, TableRowColumn } from "material-ui/Table";
import _ from "lodash";

import { ACMECorpSuperLightgreen, lightRed } from "../../colors";
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

    if (_.isUndefined(validated)) {
      label = strings.workflow.workflow_document_validate;
      style = styles.uploadButton;
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
      style = {
        ...styles.uploadButton,
        backgroundColor: ACMECorpSuperLightgreen
      };
    } else {
      label = strings.workflow.workflow_document_changed + "!";
      style = {
        ...styles.uploadButton,
        backgroundColor: lightRed
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
      const { name, hash } = document;

      if (validationActive) validated = validatedDocuments[hash];

      return (
        <TableRow key={index + "document"} selectable={false}>
          <TableRowColumn style={{ textAlign: "center" }}>
            {hash ? this.generateHashIcon(hash) : <CircularProgress size={20} />}
          </TableRowColumn>
          <TableRowColumn>{name}</TableRowColumn>
          {validationActive ? <TableRowColumn>{this.generateUploadIcon(hash, validated)}</TableRowColumn> : null}
        </TableRow>
      );
    });

  generateEmptyList = () => (
    <TableRow selectable={false}>
      <TableRowColumn>{strings.workflow.workflow_no_documents}</TableRowColumn>
    </TableRow>
  );

  render = () => {
    const { documents, validationActive, validatedDocuments } = this.props;
    return (
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          {_.isEmpty(documents)
            ? this.generateEmptyList()
            : this.generateDocumentList(documents, validationActive, validatedDocuments)}
        </TableBody>
      </Table>
    );
  };
}

export default DocumentOverview;
