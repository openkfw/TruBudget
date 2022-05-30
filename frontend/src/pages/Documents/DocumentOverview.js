import React, { Component } from "react";

import Button from "@mui/material/Button";
import FingerPrint from "@mui/icons-material/Fingerprint";
import Input from "@mui/material/Input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/GetApp";
import ValidationIcon from "@mui/icons-material/FindInPage";

import _isUndefined from "lodash/isUndefined";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import withInitialLoading from "../Loading/withInitialLoading";
import { TableHead } from "@mui/material";
import { withStyles } from "@mui/styles";
import OverflowTooltip from "../Common/OverflowTooltip";
import { DocumentEmptyState } from "./DocumentEmptyStates";

const styles = {
  validationButtonNotValidated: {
    whiteSpace: "nowrap"
  },
  validationInput: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: "100%",
    opacity: 0
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
  getPropsForValidationButton = (validated, available) => {
    let style = {};
    let label = "";
    let color = undefined;
    const disabled = !available;
    if (_isUndefined(validated)) {
      label = strings.workflow.workflow_document_validate;
    } else if (validated === true) {
      label = strings.workflow.workflow_document_validated + "!";
      color = "success";
    } else {
      label = strings.workflow.workflow_document_changed + "!";
      style = {
        ...styles.validationButtonNotValidated
      };
      color = "error";
    }

    return { style, label, color, disabled };
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

  generateValidationButton = (validated, projectId, subprojectId, workflowitemId, document) => {
    const { hash, id, available } = document;

    return (
      <Button {...this.getPropsForValidationButton(validated, available)} data-test="validation-button">
        <ValidationIcon />
        {this.getValidationText(validated)}
        <Input
          id="docvalidation"
          type="file"
          style={styles.validationInput}
          onChange={event => {
            if (event.target.files[0]) {
              const file = event.target.files[0];
              const reader = new FileReader();
              reader.onloadend = e => {
                if (e.target.result !== undefined) {
                  const dataUrl = e.target.result.split(";base64,")[1];
                  this.props.validateDocument(hash, dataUrl, id, projectId, subprojectId, workflowitemId);
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </Button>
    );
  };

  generateDocumentList = props => {
    const {
      classes,
      workflowitemId,
      projectId,
      subprojectId,
      documents,
      validatedDocuments,
      downloadDocument
    } = this.props;
    const header = this.generateDocumentListHeader();
    const rows = documents.map((document, index) => {
      let validated = undefined;
      const { id, fileName, hash } = document;
      validated = validatedDocuments[id];

      return (
        <TableRow key={index + "document"}>
          <TableCell data-test="workflowitemDocumentFileName">
            <OverflowTooltip text={fileName} maxWidth="200px" />
          </TableCell>
          <TableCell>
            <div style={{ display: "flex" }}>
              <FingerPrint style={{ paddingRight: "10px", paddingBottom: "0px" }} />
              <OverflowTooltip text={hash} maxWidth="70px" />
            </div>
          </TableCell>
          <TableCell>
            <div className={classes.actionContainer}>
              {this.generateValidationButton(validated, projectId, subprojectId, workflowitemId, document)}
              {document.id
                ? this.generateDownloadButton(downloadDocument, projectId, subprojectId, workflowitemId, document)
                : null}
            </div>
          </TableCell>
        </TableRow>
      );
    });
    return (
      <>
        {header}
        <TableBody>{rows}</TableBody>
      </>
    );
  };

  generateDocumentListHeader = () => {
    return (
      <TableHead key={"documentlistheader"}>
        <TableRow key={"documentlistheaderrow"}>
          <TableCell>
            <Typography>{strings.common.name}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{strings.common.hash}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{strings.common.actions}</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  generateEmptyList = () => (
    <div style={{ backgroundColor: "#f3f3f3" }}>
      <DocumentEmptyState captionText={strings.common.no_documents_info_text} />
    </div>
  );

  render = () => {
    const { documents, validatedDocuments, workflowitemId, projectId, subprojectId, downloadDocument } = this.props;
    return (
      <Table>
        {_isEmpty(documents)
          ? this.generateEmptyList()
          : this.generateDocumentList({
              workflowitemId,
              projectId,
              subprojectId,
              documents,
              validatedDocuments,
              downloadDocument
            })}
      </Table>
    );
  };

  generateDownloadButton(downloadDocument, projectId, subprojectId, workflowitemId, document) {
    return (
      <Button
        aria-label="Validation picture"
        data-test="download-document"
        component="span"
        disabled={!document.available}
        onClick={() => downloadDocument(projectId, subprojectId, workflowitemId, document.id)}
      >
        <DownloadIcon />
        {strings.common.download}
      </Button>
    );
  }
}

export default withInitialLoading(withStyles(styles)(DocumentOverview));
