import React from "react";

import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

class Dropdown extends React.Component {
  render() {
    const {
      value,
      children,
      id = "default",
      floatingLabel,
      onChange,
      style,
      disabled,
      formStyle,
      error,
      errorText
    } = this.props;
    return (
      <form autoComplete="off" style={formStyle}>
        <FormControl disabled={disabled} style={style} data-test={`dropdown-${id}`} error={error || false}>
          <InputLabel htmlFor={id}>{floatingLabel}</InputLabel>
          <Select
            value={value}
            onChange={v => onChange(v.target.value)}
            inputProps={{
              name: id,
              id
            }}
            MenuProps={{
              MenuListProps: {
                "data-test": "dropdown_selectList"
              }
            }}
            SelectDisplayProps={{ "data-test": `dropdown-${id}-click`, "data-disabled": disabled }}
          >
            {children}
          </Select>
          <FormHelperText>{error ? errorText : ""}</FormHelperText>
        </FormControl>
      </form>
    );
  }
}

export default Dropdown;
