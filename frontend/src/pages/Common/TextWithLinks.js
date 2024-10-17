import React, { useState } from "react";

import { Link, TextField, Typography } from "@mui/material";

const TextWithLinks = ({
  label,
  helperText,
  value,
  onChange,
  onBlur,
  onFocus,
  pattern,
  multiline = false,
  disabled = false,
  id,
  // eslint-disable-next-line no-useless-computed-key
  ["data-test"]: dataTest
}) => {
  const [inputValue, setInputValue] = useState("");
  const [url, setUrl] = useState("");

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    // Simple URL detection, could use a more robust regex for URL validation
    const urlPattern = /https?:\/\/[^\s$.?#].[^\s]*/gi;
    const detectedUrl = value.match(urlPattern);
    setUrl(detectedUrl ? detectedUrl[0] : "");
  };

  return (
    <>
      {/* TextField for input */}
      <TextField
        variant="standard"
        label={label}
        onFocus={onFocus}
        helperText={helperText}
        multiline={multiline}
        className="text-field"
        disabled={disabled}
        value={inputValue}
        id={id}
        // onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        pattern={pattern}
        data-test={dataTest}
        onChange={handleInputChange}
      />

      {/* Conditionally render the clickable URL below the TextField */}
      {url && (
        <Typography variant="body2" mt={2}>
          Clickable URL:{" "}
          <Link href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </Link>
        </Typography>
      )}
    </>
  );
};

export default TextWithLinks;
