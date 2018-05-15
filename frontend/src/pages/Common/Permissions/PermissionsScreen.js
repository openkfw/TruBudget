import React, { Component } from "react";

import Table, { TableBody, TableHead, TableCell, TableRow } from "material-ui/Table";

import { MenuItem } from "material-ui/Menu";
import Select from "material-ui/Select";
import { FormControl } from "material-ui/Form";
import Checkbox from "material-ui/Checkbox";

import Dialog, { DialogActions, DialogContent, DialogTitle } from "material-ui/Dialog";

import Button from "material-ui/Button";

import strings from "../../../localizeStrings";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";

const styles = {
  container: {
    padding: 0
  },
  dialog: {
    paddingLeft: 0,
    paddingRight: 0
  },
  tableRow: {
    borderWidth: 0
  },
  heading: {
    textAlign: "center",
    fontSize: "14px",
    verticalAlign: "bottom",
    paddingBottom: "8px"
  }
};

const PermissionsScreen = props => (
  <Dialog disableBackdropClick disableEscapeKeyDown open={props.show} style={styles.dialog}>
    <DialogTitle>{props.title}</DialogTitle>
    <DialogContent>
      <div style={styles.container}>
        <PermissionsTable {...props} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={props.onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const tableStyle = {
  container: {}
};

const selectionStyle = {
  searchContainer: {
    marginLeft: "12px",
    marginRight: "12px"
  },
  selectionContainer: {}
};
class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  resolveSelections = (user, permissions) => {
    return permissions.map(id => user.find(u => u.id === id)).map(u => u.displayName);
  };

  render() {
    const selections = this.resolveSelections(this.props.userList, this.props.permissions[this.props.name]);
    return (
      <FormControl key={this.props.name + "form"}>
        <Select
          multiple
          style={{
            width: "200px"
          }}
          autoWidth
          value={selections}
          renderValue={s => s.join(", ")}
        >
          <ListItem className="noFocus" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FormControl>
              <InputLabel>Search</InputLabel>
              <Input value={this.state.searchTerm} onChange={e => this.setState({ searchTerm: e.target.value })} />
            </FormControl>
          </ListItem>
          <div className="noFocus">
            {renderUserSelection(
              this.props.userList.filter(u =>
                u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())
              ),
              this.props.permissions[this.props.name],
              this.props.name,
              this.props.grantPermission
            )}
          </div>
        </Select>
      </FormControl>
    );
  }
}

const renderUserSelection = (user, permissionedUser, permissionName, grantPermission) =>
  user.map(u => {
    return (
      <MenuItem key={u.id + "selection"} value={u.id} onClick={() => grantPermission(permissionName, u.id)}>
        <Checkbox checked={permissionedUser.indexOf(u.id) > -1} />
        <ListItemText primary={u.displayName} />
      </MenuItem>
    );
  });

const renderPermission = (name, userList, permissions, grantPermission) => (
  <ListItem key={name + "perm"} style={styles.tableRow}>
    <ListItemText
      primary={
        <PermissionSelection
          name={name}
          userList={userList}
          permissions={permissions}
          grantPermission={grantPermission}
        />
      }
      secondary={strings.permissions[name.replace(/[.]/g, "_")] || name}
    />
  </ListItem>
);

// const PermissionsTable = ({ permissions, user, grantPermission, id, intentOrder }) => (
//   <div style={tableStyle.container}>
//     {intentOrder.map(section => {
//       return (
//         <Table key={strings.permissions[section.name]}>
//           <TableHead>
//             <TableRow>
//               <TableCell colSpan="3" style={styles.heading}>
//                 {strings.permissions[section.name]}
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {section.intents
//               .filter(i => permissions[i] !== undefined)
//               .map(p => renderPermission(p, user, permissions, grantPermission.bind(this, id)))}
//           </TableBody>
//         </Table>
//       );
//     })}
//   </div>
// );

const PermissionsTable = ({ permissions, user, grantPermission, id, intentOrder }) => (
  <div style={tableStyle.container}>
    {intentOrder.map(section => {
      return (
        <Card key={section.name + "section"} style={{ marginTop: "12px", marginBottom: "12px" }}>
          <CardHeader subheader={strings.permissions[section.name]} />
          <CardContent>
            <List>
              {section.intents
                .filter(i => permissions[i] !== undefined)
                .map(p => renderPermission(p, user, permissions, grantPermission.bind(this, id)))}
            </List>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default PermissionsScreen;
