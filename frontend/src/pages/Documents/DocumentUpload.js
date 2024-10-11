import React, { useCallback, useState } from "react";
import * as Yup from "yup";

import AddLink from "@mui/icons-material/AddLink";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAdd from "@mui/icons-material/PostAdd";
import Publish from "@mui/icons-material/Publish";
import { CircularProgress, Grid, Paper, TableHead, TextField, Tooltip } from "@mui/material";
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
  showErrorSnackbar,
  deleteDocument,
  deleteWorkflowDocument,
  deleteWorkflowDocumentExternalLink,
  projectId,
  subprojectId,
  workflowitemId
}) => {
  const defaultDocumentUrl = "https://";
  const defaultDocumentName = "";
  const [isLoading, setIsLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [comment, setComment] = useState("");
  const [externalDocumentComment, setExternalDocumentComment] = useState("");
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
    storeWorkflowDocumentExternalLink(
      externalDocumentUrl,
      externalDocumentName,
      externalDocumentHash,
      externalDocumentComment
    );
    setExternalDocumentUrl(defaultDocumentUrl);
    setExternalDocumentName(defaultDocumentName);
    setExternalDocumentHash();
    setExternalDocumentComment("");
    setExternalDocumentUrlUpdated(false);
    setExternalDocumentNameUpdated(false);
  };

  const addFile = () => {
    storeWorkflowDocument(fileToUpload?.dataUrl, fileToUpload?.name, comment);
    setFileToUpload(null);
    setComment("");
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleDeleteDocument = (id, base64, linkedFileHash) => {
    if (id !== undefined) {
      deleteDocument(projectId, subprojectId, workflowitemId, id);
    } else if (base64 !== undefined) {
      deleteWorkflowDocument(base64);
    } else {
      deleteWorkflowDocumentExternalLink(linkedFileHash);
    }
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
                        <Publish />
                      </Button>
                    </Tooltip>
                  )}
                  <Button
                    component="span"
                    disabled={!document.available && !document.link}
                    onClick={() => handleDeleteDocument(document.id, document.base64, document.linkedFileHash)}
                  >
                    <DeleteIcon />
                  </Button>
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

  const handleFileChange = useCallback(
    (event) => {
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
        setIsLoading(true);
        const reader = new FileReader();
        reader.onloadend = (e) => {
          if (e.target.result !== undefined) {
            const dataUrl = e.target.result.split(";base64,")[1];
            // data in redux store needs to be serializable, so we store base64 string
            setFileToUpload({
              name: file.name,
              dataUrl
            });
            setIsLoading(false);
          }
        };
        if (file) {
          reader.readAsDataURL(file);
        }
      }
    },
    [showErrorSnackbar, storeSnackbarMessage]
  );

  const renderFileUpload = (fileToUpload) => {
    if (isLoading) {
      return <CircularProgress />;
    } else
      return fileToUpload ? (
        <>
          {fileToUpload.name}
          <TextField
            id="document-comment"
            label={strings.common.comment_description}
            value={comment}
            onChange={handleCommentChange}
            error={false}
            helperText={strings.common.optional}
            className="document-comment-field"
          />
          <div className="document-upload-flex-container" style={{ marginTop: "0.9rem" }}>
            <Button onClick={addFile} className="document-upload-button" component="div" disabled={!fileToUpload}>
              <Publish />
              {strings.workflow.workflow_documents_add_file}
            </Button>
          </div>
        </>
      ) : (
        <Button className="document-upload-button" component="div">
          <PostAdd />
          {strings.workflow.workflow_select_document}
          <input id="docupload" type="file" className="document-upload-input" onChange={handleFileChange} />
        </Button>
      );
  };

  return (
    <div>
      <div className="document-upload-container">
        <Table className="document-upload-table">{body}</Table>
      </div>
      <Grid>
        {storageServiceAvailable && (
          <Grid>
            <Paper className="paper-forms">
              <h4>{strings.workflow.workflow_documents_upload_heading}</h4>
              <div className="document-upload-flex-container">{renderFileUpload(fileToUpload, isLoading)}</div>
            </Paper>
          </Grid>
        )}
        <Grid>
          <Paper className="paper-forms">
            <h4>{strings.workflow.workflow_documents_add_link}</h4>

            <Stack component="form" spacing={2} noValidate autoComplete="off">
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
              <TextField
                id="external-document-comment"
                label={strings.common.comment_description}
                value={externalDocumentComment}
                onChange={(event) => setExternalDocumentComment(event.target.value)}
                error={false}
                helperText={strings.common.optional}
                className="document-comment-field"
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
                  <PostAdd />
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
                <AddLink />
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
