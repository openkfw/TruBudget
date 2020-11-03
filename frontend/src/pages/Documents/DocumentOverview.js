import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import FingerPrint from "@material-ui/icons/Fingerprint";
import Input from "@material-ui/core/Input";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import DownloadIcon from "@material-ui/icons/GetApp";
import ValidationIcon from "@material-ui/icons/FindInPage";

import _isUndefined from "lodash/isUndefined";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import withInitialLoading from "../Loading/withInitialLoading";
import { withStyles } from "@material-ui/core";

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
  },
  actionContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  noHorizontalPadding: {
    paddingRight: "0px",
    paddingLeft: "0px"
  }
};

class DocumentOverview extends Component {
  constructor() {
    super();
    this.input = {};
  }
  getPropsForUploadButton = validated => {
    let style = {};
    let label = "";
    let color = "default";
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
      return strings.workflow.workflow_document_validation_ok;
    } else {
      return strings.workflow.workflow_document_validation_not_ok;
    }
  };

  generateUploadButton = (hash, validated, id) => (
    <Button {...this.getPropsForUploadButton(validated)}>
      <ValidationIcon />
      {this.getValidationText(validated)}
      <Input
        id="docvalidation"
        type="file"
        style={styles.uploadInput}
        onChange={event => {
          if (event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = e => {
              if (e.target.result !== undefined) {
                const dataUrl = e.target.result.split(";base64,")[1];
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

  generateDocumentList = props => {
    const {
      classes,
      workflowitemId,
      projectId,
      subprojectId,
      documents,
      validationActive,
      validatedDocuments,
      downloadDocument
    } = this.props;
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
            <TableCell className={classes.noHorizontalPadding}>
              <FingerPrint />
            </TableCell>
          ) : null}
          <TableCell data-test="workflowitemDocumentId" className={classes.noHorizontalPadding}>
            {id}
          </TableCell>
          {validationActive ? <TableCell>{this.generateHashIcon(hash)}</TableCell> : null}
          {validationActive ? (
            <TableCell className={classes.noHorizontalPadding}>
              <div className={classes.actionContainer}>
                {this.generateUploadButton(hash, validated, id)}
                {document.documentId
                  ? this.generateDownloadButton(downloadDocument, projectId, subprojectId, workflowitemId, document)
                  : null}
              </div>
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
        {validationActive ? <TableCell></TableCell> : null}
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
    const {
      documents,
      validationActive,
      validatedDocuments,
      workflowitemId,
      projectId,
      subprojectId,
      downloadDocument
    } = this.props;
    return (
      <Table style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        {_isEmpty(documents)
          ? this.generateEmptyList()
          : this.generateDocumentList({
              workflowitemId,
              projectId,
              subprojectId,
              documents,
              validationActive,
              validatedDocuments,
              downloadDocument
            })}
      </Table>
    );
  };

  generateDownloadButton(downloadDocument, projectId, subprojectId, workflowitemId, document) {
    return (
      <Button
        color="default"
        aria-label="upload picture"
        data-test="download-document"
        component="span"
        onClick={() => downloadDocument(projectId, subprojectId, workflowitemId, document.documentId)}
      >
        <DownloadIcon />
        {strings.common.download}
      </Button>
    );
  }
}

export default withInitialLoading(withStyles(styles)(DocumentOverview));
