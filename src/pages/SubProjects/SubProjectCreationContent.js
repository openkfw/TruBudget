import React from 'react';
import Divider from 'material-ui/Divider';
import _ from 'lodash'

import strings from '../../localizeStrings';
import TextInput from '../Common/TextInput';
import ImageSelector from '../Common/ImageSelector';
import { getCurrencies } from '../../helper';
import ProjectAmount from '../Common/ProjectAmount';

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

}

const SubProjectCreationContent = (props) => {
  return (
    <div>
      <div style={styles.inputDiv}>
        <TextInput floatingLabelText={strings.subproject.subproject_title}
          hintText={strings.subproject.subproject_title_description}
          value={props.subProjectName}
          onChange={props.storeSubProjectName}
          aria-label='nameinput'
        />
        <TextInput
          floatingLabelText={strings.subproject.subproject_comment}
          hintText={strings.common.comment_description}
          value={props.subProjectComment}
          onChange={props.storeSubProjectComment}
          multiLine={true}
          aria-label='commentinput'
        />
      </div>
      <Divider />
      <div >
        <ProjectAmount
          currencyTitle={strings.subproject.subproject_currency}
          currency={props.subProjectCurrency}
          storeCurrency={props.storeSubProjectCurrency}
          parentCurrency={props.projectCurrency}
          budgetLabel={strings.subproject.subproject_budget_amount}
          budgetHintText={strings.subproject.subproject_budget_amount_description}
          budget={props.subProjectAmount}
          storeBudget={props.storeSubProjectAmount}
        />
      </div>
    </div >
  )
}

export default SubProjectCreationContent;
