import React, { Component } from "react";

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import strings from "../../../localizeStrings";

const PermissionsScreen = props => (
  <Dialog open={props.show} onClose={props.onClose}>
    <DialogTitle>{props.title}</DialogTitle>
    <DialogContent>
      <div>
        <PermissionsTable {...props} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={props.onClose}>
        {strings.common.close}
      </Button>
    </DialogActions>
  </Dialog>
);

class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  resolveSelections = (user, permissions) => {
    if (!user || !permissions) return [];
    return permissions.map(id => user.find(u => u.id === id)).map(u => u.displayName);
  };

  render() {
    const selections = this.resolveSelections(this.props.userList, this.props.permissions[this.props.name]);
    return (
      <FormControl key={this.props.name + "form"}>
        <Select
          multiple
          style={{
            width: "350px"
          }}
          autoWidth
          value={selections}
          renderValue={s => s.join(", ")}
        >
          <ListItem className="noFocus" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FormControl>
              <InputLabel>{strings.common.search}</InputLabel>
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
              this.props.grant,
              this.props.revoke,
              this.props.myself
            )}
          </div>
        </Select>
      </FormControl>
    );
  }
}

const renderUserSelection = (user, permissionedUser, permissionName, grant, revoke, myself) =>
  user.map(u => {
    const checked = permissionedUser.indexOf(u.id) > -1;
    return (
      <MenuItem
        disabled={u.id === myself && checked}
        key={u.id + "selection"}
        value={u.id}
        onClick={checked ? () => revoke(permissionName, u.id) : () => grant(permissionName, u.id)}
      >
        <Checkbox checked={checked} />
        <ListItemText primary={u.displayName} />
      </MenuItem>
    );
  });

const renderPermission = (name, userList, permissions, myself, grant, revoke) => (
  <ListItem key={name + "perm"}>
    <ListItemText
      primary={
        <PermissionSelection
          name={name}
          userList={userList}
          permissions={permissions}
          grant={grant}
          revoke={revoke}
          myself={myself}
        />
      }
      secondary={strings.permissions[name.replace(/[.]/g, "_")] || name}
    />
  </ListItem>
);

const PermissionsTable = ({ permissions, user, grant, revoke, id, intentOrder, myself }) => (
  <div>
    {intentOrder.map(section => {
      return (
        <Card key={section.name + "section"} style={{ marginTop: "12px", marginBottom: "12px" }}>
          <CardHeader subheader={strings.permissions[section.name]} />
          <CardContent>
            <List>
              {section.intents
                .filter(i => permissions[i] !== undefined)
                .map(p => renderPermission(p, user, permissions, myself, grant.bind(this, id), revoke.bind(this, id)))}
            </List>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default PermissionsScreen;
