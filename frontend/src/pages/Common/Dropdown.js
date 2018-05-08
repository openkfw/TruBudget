import React from "react";
import Select from "material-ui/Select";
import { MenuItem } from "material-ui/Menu";
import { FormControl } from "material-ui/Form";
import { InputLabel } from "material-ui/Input";

const styles = {
  selectField: {
    width: 220
  }
};
const getMenuItems = items => {
  return items.map(item => {
    return <MenuItem key={item.value} disabled={item.disabled} value={item.value} primaryText={item.primaryText} />;
  });
};
const Dropdown = ({ value, title, onChange, items, disabled }) => {
  const menuItems = getMenuItems(items);
  return (
    <FormControl>
      <InputLabel htmlFor="age-simple">{title}</InputLabel>
      <Select
        style={styles.selectField}
        value={value}
        inputProps={{
          name: "age",
          id: "age-simple"
        }}
        onChange={(event, index, value) => onChange(value)}
        disabled={disabled}
      >
        {menuItems}
      </Select>
    </FormControl>
  );
};

// TODO: set htmlFor material v1
export default Dropdown;
