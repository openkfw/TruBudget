import React, { useState } from "react";
import * as Yup from "yup";

import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkIcon from "@mui/icons-material/Link";
import UploadIcon from "@mui/icons-material/Publish";
import { Grid, Paper, TableHead, TextField, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/system";

import strings from "../../localizeStrings";

import { DocumentEmptyState } from "./DocumentEmptyStates";

import "./DocumentUpload.scss";

const MAX_DOCUMENT_SIZE_BINARY = 100 * 1024 * 1024; // 100 MB

const uriValidation = Yup.string().url().required();

const hashValue = async (base64String) => {
  const data = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

const DocumentUpload = ({
  storeWorkflowDocument,
  storeWorkflowDocumentExternalLink,
  workflowDocuments,
  storageServiceAvailable,
  storeSnackbarMessage,
  showErrorSnackbar
}) => {
  const defaultDocumentUrl = "https://";
  const defaultDocumentName = "";
  const [externalDocumentUrl, setExternalDocumentUrl] = useState(defaultDocumentUrl);
  const [externalDocumentName, setExternalDocumentName] = useState(defaultDocumentName);
  const [externalDocumentHash, setExternalDocumentHash] = useState();
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
    storeWorkflowDocumentExternalLink(externalDocumentUrl, externalDocumentName, externalDocumentHash);
    setExternalDocumentUrl(defaultDocumentUrl);
    setExternalDocumentName(defaultDocumentName);
    setExternalDocumentHash();
  };

  const body = (
    <TableBody>
      {workflowDocuments.length > 0 ? (
        <>
          <TableHead>
            <TableRow>
              <TableCell>Documents/Links to save</TableCell>
            </TableRow>
          </TableHead>
          {workflowDocuments.map((document, index) => (
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
          ))}
        </>
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
      <Grid container spacing={2}>
        {storageServiceAvailable && (
          <Grid item xs={6}>
            <Paper>
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
                        if (file.size > MAX_DOCUMENT_SIZE_BINARY) {
                          storeSnackbarMessage(
                            `File size exceeds the limit of ${Math.round(MAX_DOCUMENT_SIZE_BINARY / (1024 * 1024))} MB`
                          );
                          showErrorSnackbar();
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
            </Paper>
          </Grid>
        )}
        <Grid item xs={6}>
          <Paper>
            <div style={{ margin: "0 10px" }}>
              <Stack
                component="form"
                sx={{
                  width: "25ch"
                }}
                spacing={2}
                noValidate
                autoComplete="off"
              >
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
              </Stack>
              {externalDocumentHash ? (
                "Hash created"
              ) : (
                <Button className="document-upload-button" component="div">
                  <UploadIcon />
                  Upload same document to create hash
                  <input
                    id="docupload"
                    type="file"
                    className="document-upload-input"
                    onChange={(event) => {
                      if (event.target.files[0]) {
                        const file = event.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = async (e) => {
                          if (e.target.result !== undefined) {
                            const dataBase64 = e.target.result.split(";base64,")[1];
                            const newHash = await hashValue(dataBase64);
                            setExternalDocumentHash(newHash);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              )}
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
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DocumentUpload;
