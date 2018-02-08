import React from 'react'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const styles = {
  selectField: {
    width: 220
  }
}
const getMenuItems = (items) => {
  return items.map((item) => {
    return (
      <MenuItem key={item.value} disabled={item.disabled} value={item.value} primaryText={item.primaryText} />
    )
  })
}
const Dropdown = ({ value, title, onChange, items }) => {
  const menuItems = getMenuItems(items)
  return (
    <SelectField style={styles.selectField}
      floatingLabelText={title}
      value={value}
      onChange={(event, index, value) => onChange(value)}
    >
      {menuItems}
    </SelectField>

  )
}
export default Dropdown
