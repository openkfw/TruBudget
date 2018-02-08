import React from 'react';
import Divider from 'material-ui/Divider';

import strings from '../../localizeStrings';
import ProjectBudget from '../Common/ProjectBudget';
import ProjectAlias from '../Common/ProjectAlias';

const SubProjectCreationContent = (props) => {
  return (
    <div>
      <div>
        <ProjectAlias
          nameLabel={strings.subproject.subproject_title}
          nameHintText={strings.subproject.subproject_title_description}
          name={props.subProjectName}
          nameOnChange={props.storeSubProjectName}
          commentLabel={strings.subproject.subproject_comment}
          commentHintText={strings.common.comment_description}
          comment={props.subProjectComment}
          commentOnChange={props.storeSubProjectComment} />
      </div>
      <Divider />
      <div >
        <ProjectBudget
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
