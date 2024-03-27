import React, { Component } from "react";
import _isEmpty from "lodash/isEmpty";
import _isUndefined from "lodash/isUndefined";

import DeleteIcon from "@mui/icons-material/Delete";
import ValidationIcon from "@mui/icons-material/FindInPage";
import FingerPrint from "@mui/icons-material/Fingerprint";
import DownloadIcon from "@mui/icons-material/GetApp";
import LinkIcon from "@mui/icons-material/Link";
import { TableHead } from "@mui/material";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";
import OverflowTooltip from "../Common/OverflowTooltip";
import withInitialLoading from "../Loading/withInitialLoading";

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

  hashValue = async (base64String) => {
    const data = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  };

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

  getValidationText = (validated) => {
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
          onChange={(event) => {
            if (event.target.files[0]) {
              const file = event.target.files[0];
              const reader = new FileReader();
              reader.onloadend = async (e) => {
                if (e.target.result !== undefined) {
                  const dataBase64 = e.target.result.split(";base64,")[1];
                  const newHash = await this.hashValue(dataBase64);
                  this.props.validateDocument({
                    hash,
                    newHash,
                    projectId,
                    subprojectId,
                    workflowitemId,
                    documentId: id
                  });
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </Button>
    );
  };

  generateDocumentList = () => {
    const {
      workflowitemId,
      projectId,
      subprojectId,
      documents,
      validatedDocuments,
      downloadDocument,
      deleteDocument,
      workflowitemStatus
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
            {document.link ? (
              <Tooltip title={document.link}>
                <div style={{ overflow: "hidden", maxWidth: "170px", color: "#333333" }}>{document.link}</div>
              </Tooltip>
            ) : (
              <div style={{ display: "flex" }}>
                <FingerPrint style={{ paddingRight: "10px", paddingBottom: "0px" }} />
                <OverflowTooltip text={hash} maxWidth="70px" />
              </div>
            )}
          </TableCell>
          <TableCell>
            <div style={styles.actionContainer}>
              {document.id &&
                document.hash &&
                this.generateValidationButton(validated, projectId, subprojectId, workflowitemId, document)}
              {document.id &&
                document.hash &&
                this.generateDownloadButton(downloadDocument, projectId, subprojectId, workflowitemId, document)}
              {document.id && document.link && this.generateLinkButton(document)}
              {document.id
                ? this.renderDeleteButton({
                    deleteDocument,
                    projectId,
                    subprojectId,
                    workflowitemId,
                    document,
                    workflowitemStatus
                  })
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
    <TableBody>
      <TableRow>
        <TableCell>
          <div style={{ backgroundColor: "#f3f3f3" }}>
            <DocumentEmptyState captionText={strings.common.no_documents_info_text} />
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  render = () => {
    const {
      documents,
      validatedDocuments,
      workflowitemId,
      projectId,
      subprojectId,
      downloadDocument,
      workflowitemStatus
    } = this.props;
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
              downloadDocument,
              workflowitemStatus
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

  generateLinkButton(document) {
    return (
      <Button
        aria-label="Open external link"
        data-test="open-external-link"
        component="span"
        onClick={(event) => {
          event.preventDefault();
          window.open(document.link, "_blank");
        }}
      >
        <LinkIcon />
        {strings.common.open}
      </Button>
    );
  }

  renderDeleteButton({ deleteDocument, projectId, subprojectId, workflowitemId, document, workflowitemStatus }) {
    return (
      <Button
        data-test="delete-document"
        component="span"
        disabled={(!document.available && !document.link) || workflowitemStatus !== "open"}
        onClick={() => deleteDocument(projectId, subprojectId, workflowitemId, document.id)}
      >
        <DeleteIcon />
        {strings.common.delete}
      </Button>
    );
  }
}

export default withInitialLoading(DocumentOverview);
