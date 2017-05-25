import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

const RoleSelectionContent = (props) => {
  return (
    <AutoComplete dataSource={props.dataSource} />
  )
}

export default RoleSelectionContent;
