import React from 'react'
import TextField from 'material-ui/TextField';

const styles = {
  textField: {
    width: 220
  }
}

const TextInput = ({ ariaLabel, floatingLabelText, hintText, value, onChange, multiLine = false, type = 'text', disabled = false }) => (
  <TextField
    id={hintText}
    floatingLabelText={floatingLabelText}
    hintText={hintText}
    multiLine={multiLine}
    aria-label={ariaLabel}
    style={styles.textField}
    disabled={disabled}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  />
)

export default TextInput;
