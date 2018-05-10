import React from "react";
import TextField from "material-ui/TextField";

const styles = {
  textField: {
    width: 200,
    paddingRight: 20
  }
};

const TextInput = ({
  ariaLabel,
  label,
  helperText,
  value,
  onChange,
  onBlur,
  pattern,
  multiLine = false,
  type = "text",
  disabled = false
}) => (
  <TextField
    label={label}
    helperText={helperText}
    multiLine={multiLine}
    aria-label={ariaLabel}
    style={styles.textField}
    disabled={disabled}
    value={value}
    onChange={event => onChange(event.target.value)}
    onBlur={onBlur}
    pattern={pattern}
  />
);

export default TextInput;
