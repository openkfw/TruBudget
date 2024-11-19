import React from "react";

import TextField from "@mui/material/TextField";

const TextInput = ({
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
  maxLengthValue,
  // eslint-disable-next-line no-useless-computed-key
  ["data-test"]: dataTest
}) => (
  <TextField
    variant="standard"
    label={label}
    onFocus={onFocus}
    helperText={helperText}
    multiline={multiline}
    className="text-field"
    disabled={disabled}
    value={value}
    id={id}
    onChange={(event) => onChange(event.target.value)}
    onBlur={onBlur}
    pattern={pattern}
    data-test={dataTest}
    inputProps={{ maxLength: maxLengthValue }}
  />
);

export default TextInput;
