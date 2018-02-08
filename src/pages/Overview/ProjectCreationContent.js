import React from 'react';
import Divider from 'material-ui/Divider';
import _ from 'lodash'

import strings from '../../localizeStrings'
import TextInput from '../Common/TextInput';
import Dropdown from '../Common/Dropdown';
import ImageSelector from '../Common/ImageSelector';
import { getCurrencies } from '../../helper';

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  divider: {
    width: '100%'
  },

}

const ProjectCreationContent = (props) => {
  const { parentCurrency } = props;
  const currencies = getCurrencies(parentCurrency);
  return (
    <div>
      <div style={styles.inputDiv}>
        <TextInput floatingLabelText={strings.project.project_title}
          hintText={strings.project.project_title_description}
          value={props.projectName}
          onChange={props.storeProjectName}
          aria-label='nameinput'
        />
        <TextInput
          floatingLabelText={strings.project.project_comment}
          hintText={strings.common.comment_description}
          value={props.projectComment}
          onChange={props.storeProjectComment}
          multiLine={true}
          aria-label='commentinput'
        />
      </div>
      <Divider />
      <div style={styles.inputDiv}>
        <Dropdown
          title={strings.project.project_currency}
          value={props.projectCurrency}
          onChange={props.storeProjectCurrency}
          items={currencies}
        />
        <TextInput
          floatingLabelText={strings.project.project_budget_amount}
          hintText={strings.common.project_budget_amount_description}
          value={props.projectAmount}
          onChange={props.storeProjectAmount}
          type='number'
          aria-label='amount'
        />

      </div>
      <Divider />
      <ImageSelector onTouchTap={props.storeProjectThumbnail} selectedImage={props.projectThumbnail} />
    </div >
  )

}

export default ProjectCreationContent;
