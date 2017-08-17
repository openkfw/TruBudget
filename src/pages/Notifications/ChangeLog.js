import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import moment from 'moment';
import { ACMECorpLightgreen } from '../../colors.js';
import strings from '../../localizeStrings'
const getListEntries = (historyItems, users) => {
  return historyItems.map((item, index) => {
    const userId = typeof item.data.from !== "undefined" ? item.data.from : 'jzakotnik'
    return (
      <ListItem key={index}
        primaryText={item.data.description}
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
