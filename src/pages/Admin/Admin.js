import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import RolesTable from './RolesTable';
import UsersTable from './UsersTable';
import RolesDialog from './RolesDialog';

const styles = {

  backgroundImage: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    backgroundImage: 'url("/navbar_back3.jpg")',
    backgroundSize: 'cover',
    alignItems: 'center',
    minHeight: '600px'
  }
};


const Admin = (props) => {
  return (
    <div style={ styles.backgroundImage }>
      <div style={ { width: '60%', marginTop: '50px' } }>
        <Tabs>
          <Tab label="Roles">
            <RolesTable {...props}/>
          </Tab>
          <Tab label="Users">
            <UsersTable/>
          </Tab>
          <Tab label="Nodes">
          </Tab>
        </Tabs>
      </div>
      <RolesDialog {...props}/>
    </div>
  )
}
export default Admin;