import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import moment from 'moment';
import { ACMECorpLightgreen } from '../../colors.js';
import strings from '../../localizeStrings';
import { statusMapping } from '../../helper';


const getDescription = (item) => {
  const { data } = item;
  const { action } = data;
  const templateString = strings.history[action];
  switch (action) {
    case 'edit_status': {
      const { workflowName, newData } = data;
      return strings.formatString(templateString, workflowName, statusMapping[newData])
    } break;
    case 'edit_amount': {
      const { workflowName, newData, oldData } = data;
      return strings.formatString(templateString, workflowName, oldData, newData)
    } break;
    case 'edit_amountType': {
      const { workflowName, newData, oldData } = data;
      return strings.formatString(templateString, workflowName, oldData, newData)
    } break;
    case 'edit_comment': {
      const { workflowName, newData } = data;
      return strings.formatString(templateString, workflowName, newData)
    } break;
    case 'edit_workflowName': {
      const { workflowName, newData, oldData } = data;
      return strings.formatString(templateString, oldData, newData)
    } break;
    case 'created_workflow': {
      const { workflowName } = data.data;
      return strings.formatString(templateString, workflowName)
    } break;
    case 'created_project': {
      return templateString;
    } break;
    case 'created_subproject': {
      const { projectName } = data.data;
      return strings.formatString(templateString, projectName)
    } break;
    case 'sort': {
      const { workflowName, previousName, first } = data.data;
      if (first) {
        const templateString = strings.history['first_sort'];
        return strings.formatString(templateString, workflowName)
      }
      return strings.formatString(templateString, workflowName, previousName)
    } break;
    case 'edit_subproject': {
      const { amount, subProjectName } = data.data;
      return strings.formatString(templateString, subProjectName, amount)
    } break;
    case 'edit_documents': {
      const { workflowName } = data
      return strings.formatString(templateString, workflowName)
    } break;
    default:
      break;
  }
}

const getListEntries = (historyItems, users) => {
  return historyItems.map((item, index) => {
    const userId = typeof item.data.from !== "undefined" ? item.data.from : 'jzakotnik'
    const description = getDescription(item)
    return (
      <ListItem key={index}
        primaryText={description}
        leftAvatar={<Avatar src={users[userId].avatar} />}
        secondaryText={item.blocktime ? moment(item.blocktime, 'X').fromNow() : 'Processing ...'}
      />
    );
  });
}


const getSideBar = (hideHistory, historyItems, users) => {
  const listEntries = getListEntries(historyItems, users)
  return (
    <div style={{
      flex: '1'
    }}>
      <Card key={"fsdf"} style={{
        width: '300px',
        height: '655px',
      }} >
        <CardHeader title={strings.common.history} titleColor='white' style={{ backgroundColor: ACMECorpLightgreen }} />
        <List style={{ overflowX: 'auto', height: '550px' }}>
          {listEntries}
        </List>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          <FlatButton label={strings.common.close} onTouchTap={hideHistory} primary={true} />
        </div>
      </Card>
    </div>
  )
}

const ChangeLog = ({ hideHistory, historyItems, users, showHistory }) => {

  return (
    <div style={{
      position: 'fixed',
      top: '0px',
      right: '0px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      alignItems: 'center',
      flex: 1
    }}>
      <CSSTransitionGroup
        transitionName="history"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}>
        {showHistory ? getSideBar(hideHistory, historyItems, users) : null}
      </CSSTransitionGroup>
    </div>
  )

}

export default ChangeLog;
