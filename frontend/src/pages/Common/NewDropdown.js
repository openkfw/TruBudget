import React from "react";
import { InputLabel } from "material-ui/Input";
import { FormControl } from "material-ui/Form";
import Select from "material-ui/Select";

class Dropdown extends React.Component {
  render() {
    const { value, children, id = "default", floatingLabel, onChange, style } = this.props;
    return (
      <form autoComplete="off">
        <FormControl style={style}>
          <InputLabel htmlFor={id}>{floatingLabel}</InputLabel>
          <Select
            value={value}
            onChange={v => onChange(v.target.value)}
            inputProps={{
              name: id,
              id
            }}
          >
            {children}
          </Select>
        </FormControl>
      </form>
    );
  }
}

export default Dropdown;
