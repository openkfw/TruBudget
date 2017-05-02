import React from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Card, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';


const getListEntries = (historyItems, users) => {
  return historyItems.map((item, index) => {
    const userId = typeof item.data.from !== "undefined" ? item.data.from : 'jzakotnik'
    return (
      <ListItem key={index}
        primaryText={item.data.description}
        leftAvatar={<Avatar src={users[userId].avatar}/>}
      />
    );
  });
}


const getSideBar = (hideHistory, historyItems, users) => {
const listEntries = getListEntries(historyItems, users)
 return (
   <Card key={"fsdf"} style={{
     width: '300px',
     height: '90%',
     marginBottom: '8px'
   }} >
      <CardHeader title='History'/>
        <List>
          {listEntries}
        </List>
      <FlatButton label="Close" onTouchTap={hideHistory} primary={true} />
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
