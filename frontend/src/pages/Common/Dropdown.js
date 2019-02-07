import React from "react";

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

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
