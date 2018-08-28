import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import FingerPrint from "@material-ui/icons/Fingerprint";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";

import _isUndefined from "lodash/isUndefined";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import withInitialLoading from "../Loading/withInitialLoading";
const styles = {
  uploadButton: {
    cursor: "pointer",
    verticalAlign: "middle"
  },
  uploadButtonValidated: {
    cursor: "pointer"
  },
  uploadButtonNotValidated: {
    cursor: "pointer",
    whiteSpace: "nowrap"
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
    display: "flex"
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
    let color = null;
    if (_isUndefined(validated)) {
      label = strings.workflow.workflow_document_validate;
      style = { ...styles.uploadButton };
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
      style = {
        ...styles.uploadButtonValidated
      };
      color = "primary";
    } else {
      label = strings.workflow.workflow_document_changed + "!";
      style = {
        ...styles.uploadButtonNotValidated
      };
      color = "secondary";
    }

    return { style, label, color };
  };

  getValidationText = validated => {
    if (_isUndefined(validated)) {
      return "Validate";
    } else if (validated === true) {
      return "OK";
    } else {
      return "Not OK";
    }
  };

  generateUploadIcon = (hash, validated, id) => (
    <Button {...this.getPropsForUploadButton(validated)}>
      {this.getValidationText(validated)}
      <input
        id="docvalidation"
        type="file"
        style={styles.uploadInput}
        onChange={event => {
          const file = event.target.files[0];
          const reader = new FileReader();
          reader.onloadend = e => {
            if (e.target.result !== undefined) {
              //TODO: make own function to convert file into base64String
              const dataUrl = e.target.result.split("base64,")[1];
              this.props.validateDocument(hash, dataUrl, id);
            }
          };
          console.log(file);
          reader.readAsDataURL(file);
        }}
      />
    </Button>
  );

  generateHashIcon = hash => (
    <div style={styles.hashButton}>
      <Typography>{`${hash.slice(0, 6)}...`}</Typography>
    </div>
  );

  generateDocumentList = (documents, validationActive = false, validatedDocuments = {}) => {
    const header = this.generateDocumentListHeader(validationActive);
    const rows = documents.map((document, index) => {
      let validated = undefined;
      const { id, hash } = document;
      if (validationActive) {
        validated = validatedDocuments[id];
      }
      return (
        <TableRow key={index + "document"}>
          <TableCell>
            <FingerPrint />
          </TableCell>
          <TableCell>{id}</TableCell>
          {validationActive ? <TableCell>{this.generateHashIcon(hash)}</TableCell> : null}
          {validationActive ? (
            <TableCell style={{ textAlign: "center", paddingLeft: "0px" }}>
              {this.generateUploadIcon(hash, validated, id)}
            </TableCell>
          ) : null}
        </TableRow>
      );
    });
    return (
      <div>
        {header}
        {rows}
      </div>
    );
  };

  generateDocumentListHeader = validationActive => {
    return (
      <TableRow key={"documentlistheader"} style={styles.documentListHeader}>
        <TableCell />
        <TableCell>
          <Typography variant="body2">{strings.common.name}</Typography>
        </TableCell>
        {validationActive ? (
          <TableCell>
            <Typography variant="body2">{strings.workflow.workflow_fingerprint}</Typography>
          </TableCell>
        ) : null}
        {validationActive ? (
          <TableCell>
            <Typography style={{ paddingLeft: "0px" }} variant="body2">
              {strings.common.actions}
            </Typography>
          </TableCell>
        ) : null}
      </TableRow>
    );
  };

  generateEmptyList = () => (
    <TableRow>
      <TableCell>{strings.workflow.workflow_no_documents}</TableCell>
    </TableRow>
  );

  render = () => {
    const { documents, validationActive, validatedDocuments, loadingVisible } = this.props;
    return (
      <Table style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        <TableBody>
          {_isEmpty(documents)
            ? this.generateEmptyList()
            : this.generateDocumentList(documents, validationActive, validatedDocuments, loadingVisible)}
        </TableBody>
      </Table>
    );
  };
}

export default withInitialLoading(DocumentOverview);
