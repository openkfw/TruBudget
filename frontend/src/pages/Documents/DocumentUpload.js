import React, { useState } from "react";
import * as Yup from "yup";

import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkIcon from "@mui/icons-material/Link";
import UploadIcon from "@mui/icons-material/Publish";
import { TextField, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import { DocumentEmptyState } from "./DocumentEmptyStates";

import "./DocumentUpload.scss";

const uriValidation = Yup.string().url().required();

const DocumentUpload = ({
  storeWorkflowDocument,
  storeWorkflowDocumentExternalLink,
  workflowDocuments,
  storageServiceAvailable
}) => {
  const defaultDocumentUrl = "https://";
  const defaultDocumentName = "";
  const [externalDocumentUrl, setExternalDocumentUrl] = useState(defaultDocumentUrl);
  const [externalDocumentName, setExternalDocumentName] = useState(defaultDocumentName);
  const [externalDocumentUrlError, setExternalDocumentUrlError] = useState(false);
  const [externalDocumentUrlUpdated, setExternalDocumentUrlUpdated] = useState(false);
  const [externalDocumentUrlHelperText, setExternalDocumentUrlHelperText] = useState("");
  const [externalDocumentNameError, setExternalDocumentNameError] = useState(false);
  const [externalDocumentNameUpdated, setExternalDocumentNameUpdated] = useState(false);
  const [externalDocumentNameHelperText, setExternalDocumentNameHelperText] = useState("");

  const validateExternalDocumentUrl = (value) => {
    // is not valid url
    const { error } = uriValidation.validate(value);
    if (error && value !== "") {
      setExternalDocumentUrlError(true);
      setExternalDocumentUrlHelperText("Incorrect entry.");
      return false;
    } else {
      setExternalDocumentUrlError(false);
      setExternalDocumentUrlHelperText("");
    }
    return true;
  };

  const validateExternalDocumentName = (value) => {
    if (value === "") {
      setExternalDocumentNameError(true);
      setExternalDocumentNameHelperText("Document name cannot be blank.");
      return false;
    } else {
      setExternalDocumentNameError(false);
      setExternalDocumentNameHelperText("");
    }
    return true;
  };

  const handleExternalDocumentUrlChange = (event) => {
    const value = event.target.value;
    validateExternalDocumentUrl(value);
    setExternalDocumentUrlUpdated(true);
    setExternalDocumentUrl(value);
  };

  const handleExternalDocumentNameChange = (event) => {
    const value = event.target.value;
    validateExternalDocumentName(value);
    setExternalDocumentNameUpdated(true);
    setExternalDocumentName(value);
  };

  const addExternalLink = () => {
    storeWorkflowDocumentExternalLink(externalDocumentUrl, externalDocumentName);
    setExternalDocumentUrl(defaultDocumentUrl);
    setExternalDocumentName(defaultDocumentName);
  };

  const body = (
    <TableBody>
      {workflowDocuments.length > 0 ? (
        workflowDocuments.map((document, index) => (
          <TableRow key={`${index}-${document.fileName}`}>
            <TableCell className="document-link-cell" data-test="workflowitemDocumentFileName">
              <Typography variant="body1" component="div">
                {document.fileName}
                {document.link && (
                  <Tooltip title={document.link}>
                    <Button
                      onClick={(event) => {
                        event.preventDefault();
                        window.open(document.link, "_blank");
                      }}
                      component="div"
                    >
                      <LinkIcon />
                    </Button>
                  </Tooltip>
                )}
              </Typography>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell className="document-empty-state-bg">
            <DocumentEmptyState />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <div>
      <div className="document-upload-container">
        <Table className="document-upload-table">{body}</Table>
      </div>
      {storageServiceAvailable && (
        <>
          <div className="document-upload-flex-container">
            <Button className="document-upload-button" component="div">
              <UploadIcon />
              {strings.workflow.workflow_upload_document}
              <input
                id="docupload"
                type="file"
                className="document-upload-input"
                onChange={(event) => {
                  if (event.target.files) {
                    const file = event.target.files[0];
                    const maxSize = 105 * 1024 * 1024; // 105MB
                    if (file.size > maxSize) {
                      // todo dispatch action to show error message
                      console.log("File size exceeds the limit of 105MB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = (e) => {
                      if (e.target.result !== undefined) {
                        const dataUrl = e.target.result.split(";base64,")[1];
                        // data in redux store needs to be serializable, so we store base64 string
                        storeWorkflowDocument(dataUrl, file.name);
                      }
                    };
                    if (file) {
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
            </Button>
          </div>
          <div className="document-upload-flex-container">
            <div className="or-label">or</div>
          </div>
        </>
      )}
      <div className="document-upload-flex-container">
        <TextField
          id="external-document-url"
          label="External link URL"
          value={externalDocumentUrl}
          onChange={handleExternalDocumentUrlChange}
          error={externalDocumentUrlError}
          helperText={externalDocumentUrlHelperText}
          className="document-external-link-input"
        />
        <TextField
          id="external-document-url"
          label="External document name"
          value={externalDocumentName}
          onChange={handleExternalDocumentNameChange}
          error={externalDocumentNameError}
          helperText={externalDocumentNameHelperText}
        />
      </div>
      <div className="document-upload-flex-container">
        <Button
          onClick={addExternalLink}
          className="document-upload-button"
          component="div"
          disabled={
            externalDocumentUrlError ||
            externalDocumentNameError ||
            !externalDocumentUrlUpdated ||
            !externalDocumentNameUpdated
          }
        >
          <AddLinkIcon />
          Add external link
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
