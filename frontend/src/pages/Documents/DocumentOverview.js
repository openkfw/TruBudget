import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import FingerPrint from "@material-ui/icons/Fingerprint";
import Input from "@material-ui/core/Input";
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
  uploadButtonNotValidated: {
    whiteSpace: "nowrap"
  },
  uploadInput: {
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
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
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
      return strings.workflow.workflow_document_validate;
    } else if (validated === true) {
      return "OK";
    } else {
      return "Not OK";
    }
  };

  generateUploadIcon = (hash, validated, id) => (
    <Button {...this.getPropsForUploadButton(validated)}>
      {this.getValidationText(validated)}
      <Input
        id="docvalidation"
        type="file"
        style={styles.uploadInput}
        onChange={event => {
          if (event.target.files[0]) {
            const file = event.target.files[0];
            console.log("File: ", file);
            const reader = new FileReader();
            reader.onloadend = e => {
              if (e.target.result !== undefined) {
                const dataUrl = e.target.result.split(";base64,")[1];
                console.log("dataUrl: ", dataUrl);
                this.props.validateDocument(hash, dataUrl, id);
              }
            };
            reader.readAsDataURL(file);
          }
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
          {validationActive ? (
            <TableCell style={{ paddingRight: "0px", paddingLeft: "0px" }}>
              <FingerPrint />
            </TableCell>
          ) : null}
          <TableCell data-test="workflowitemDocumentId" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
            {id}
          </TableCell>
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
      <TableBody>
        {header}
        {rows}
      </TableBody>
    );
  };

  generateDocumentListHeader = validationActive => {
    return (
      <TableRow key={"documentlistheader"} style={styles.documentListHeader}>
        {validationActive ? <TableCell /> : null}
        <TableCell>
          <Typography variant="body1">{strings.common.name}</Typography>
        </TableCell>
        {validationActive ? (
          <TableCell>
            <Typography variant="body1">{strings.workflow.workflow_fingerprint}</Typography>
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
    <TableBody>
      <TableRow>
        <TableCell>{strings.workflow.workflow_no_documents}</TableCell>
      </TableRow>
    </TableBody>
  );

  render = () => {
    const { documents, validationActive, validatedDocuments, loadingVisible } = this.props;
    return (
      <Table style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        {_isEmpty(documents)
          ? this.generateEmptyList()
          : this.generateDocumentList(documents, validationActive, validatedDocuments, loadingVisible)}
      </Table>
    );
  };
}

export default withInitialLoading(DocumentOverview);
