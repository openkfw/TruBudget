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

const styles = {
  orLabel: {
    paddingTop: "5px",
    verticalAlign: "middle"
  },
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
  }
};

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
            <TableCell
              style={{ textAlign: "center", backgroundColor: "#f3f3f3" }}
              data-test="workflowitemDocumentFileName"
            >
              <Typography variant="body1">
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
          <TableCell style={{ backgroundColor: "#f3f3f3" }}>
            <DocumentEmptyState />
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        <Table style={{ width: "40%" }}>{body}</Table>
      </div>
      {storageServiceAvailable && (
        <>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
            <Button style={styles.uploadButton} component="div">
              <UploadIcon />
              {strings.workflow.workflow_upload_document}
              <input
                id="docupload"
                type="file"
                style={styles.uploadInput}
                onChange={(event) => {
                  if (event.target.files) {
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = (e) => {
                      if (e.target.result !== undefined) {
                        const dataUrl = e.target.result.split(";base64,")[1];
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
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
            <div style={styles.orLabel}>or</div>
          </div>
        </>
      )}
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
        <TextField
          id="external-document-url"
          label="External link URL"
          value={externalDocumentUrl}
          onChange={handleExternalDocumentUrlChange}
          error={externalDocumentUrlError}
          helperText={externalDocumentUrlHelperText}
          style={{ marginRight: "5px" }}
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
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
        <Button
          onClick={addExternalLink}
          style={styles.uploadButton}
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
