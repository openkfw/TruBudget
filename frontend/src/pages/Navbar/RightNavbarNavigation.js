import React from 'react';
import NavbarIcons from './NavbarIcons'
import colors from '../../colors'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: colors.lightColor,
    paddingRight: '10px'
  }

}

const RightNavbarNavigations = ({ peers, unreadNotifications, history, logout, organization }) => {
  return (
    <div style={styles.container} >
      <span style={styles.text}
      >
        {organization}
      </span>
      <NavbarIcons unreadNotifications={unreadNotifications} peers={peers} history={history} logout={logout} />
    </div >
  )
}


export default RightNavbarNavigations;
