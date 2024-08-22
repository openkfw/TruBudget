import React, { useState } from "react";
import * as Yup from "yup";

import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkIcon from "@mui/icons-material/Link";
import PostAddIcon from "@mui/icons-material/PostAdd";
import UploadIcon from "@mui/icons-material/Publish";
import { Grid, Paper, TableHead, TextField, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
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
  const [fileToUpload, setFileToUpload] = useState(null);
  const [externalDocumentUrl, setExternalDocumentUrl] = useState(defaultDocumentUrl);
  const [externalDocumentName, setExternalDocumentName] = useState(defaultDocumentName);
  const [externalDocumentHash, setExternalDocumentHash] = useState();
  const [externalDocumentUrlError, setExternalDocumentUrlError] = useState(false);
  const [externalDocumentUrlUpdated, setExternalDocumentUrlUpdated] = useState(false);
  const [externalDocumentUrlHelperText, setExternalDocumentUrlHelperText] = useState("");
  const [externalDocumentNameError, setExternalDocumentNameError] = useState(false);
  const [externalDocumentNameUpdated, setExternalDocumentNameUpdated] = useState(false);
  const [externalDocumentNameHelperText, setExternalDocumentNameHelperText] = useState("");

  const validateExternalDocumentUrl = async (value) => {
    // is not valid url
    let error;
    try {
      await uriValidation.validate(value);
    } catch (err) {
      error = err;
    }

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

  const addFile = () => {
    storeWorkflowDocument(fileToUpload?.dataUrl, fileToUpload?.name);
    setFileToUpload(null);
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
            <Paper className="paper-forms">
              <h4>{strings.workflow.workflow_documents_upload_heading}</h4>
              <div className="document-upload-flex-container">
                {fileToUpload ? (
                  strings.workflow.workflow_documents_file_prepared
                ) : (
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
                              `${strings.workflow.workflow_documents_size_exceed} ${Math.round(
                                MAX_DOCUMENT_SIZE_BINARY / (1024 * 1024)
                              )} MB`
                            );
                            showErrorSnackbar();
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = (e) => {
                            if (e.target.result !== undefined) {
                              const dataUrl = e.target.result.split(";base64,")[1];
                              // data in redux store needs to be serializable, so we store base64 string
                              // storeWorkflowDocument(dataUrl, file.name);
                              setFileToUpload({
                                name: file.name,
                                dataUrl
                              });
                            }
                          };
                          if (file) {
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </Button>
                )}
              </div>

              <div className="document-upload-flex-container" style={{ marginTop: "0.9rem" }}>
                <Button onClick={addFile} className="document-upload-button" component="div" disabled={!fileToUpload}>
                  <PostAddIcon />
                  {strings.workflow.workflow_documents_add_file}
                </Button>
              </div>
            </Paper>
          </Grid>
        )}
        <Grid item xs={6}>
          <Paper className="paper-forms">
            <h4>{strings.workflow.workflow_documents_add_link}</h4>

            <Stack
              component="form"
              sx={{
                width: "35ch"
              }}
              spacing={2}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="external-document-url"
                label={strings.workflow.workflow_documents_link_url}
                value={externalDocumentUrl}
                onChange={handleExternalDocumentUrlChange}
                error={externalDocumentUrlError}
                helperText={externalDocumentUrlHelperText}
                className="document-external-link-input"
              />
              <TextField
                id="external-document-url"
                label={strings.workflow.workflow_documents_link_name}
                value={externalDocumentName}
                onChange={handleExternalDocumentNameChange}
                error={externalDocumentNameError}
                helperText={externalDocumentNameHelperText}
              />
            </Stack>
            {externalDocumentHash ? (
              <div className="document-upload-flex-container">{strings.workflow.workflow_documents_file_prepared}</div>
            ) : (
              <FormControl className="document-external-link-input document-external-link-upload">
                <InputLabel size="small" shrink={true} className="document-external-link-upload-label">
                  {strings.workflow.workflow_documents_upload_same_document}
                </InputLabel>
                <Button className="document-upload-button" component="div">
                  <UploadIcon />
                  {strings.workflow.workflow_upload_document}
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
              </FormControl>
            )}
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
                {strings.workflow.workflow_documents_add_link}
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default DocumentUpload;
