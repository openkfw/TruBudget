import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import moment from 'moment';


const getListEntries = (historyItems, users) => {
  return historyItems.map((item, index) => {
    const userId = typeof item.data.from !== "undefined" ? item.data.from : 'jzakotnik'
    return (
      <ListItem key={index}
        primaryText={item.data.description}
        leftAvatar={<Avatar src={users[userId].avatar}/>}
        secondaryText={moment(item.blocktime, 'X').fromNow()}
      />
    );
  });
}


const getSideBar = (hideHistory, historyItems, users) => {
const listEntries = getListEntries(historyItems, users)
 return (
   <Card key={"fsdf"} style={{
     width: '300px',
     height: '655px',
     marginBottom: '8px',
   }} >
      <CardHeader title='History'/>
        <List style={{overflowX: 'auto', height: '550px'}}>
          {listEntries}
        </List>
      <div style={{display: 'flex', flex: 1, justifyContent:'flex-end'}}>
      <FlatButton label="Close" onTouchTap={hideHistory} primary={true} />
      </div>
   </Card>
 )
}

const ChangeLog = ({hideHistory, historyItems, users, showHistory}) => {
  return(
      <div style={{
        position: 'fixed',
        top: '60px',
        height: '100%',
        right: '5px',
        zIndex: 2000,
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
