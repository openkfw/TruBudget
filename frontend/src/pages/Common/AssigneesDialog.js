import React, { Component } from "react";
import Avatar from "material-ui/Avatar";

import Chip from "material-ui/Chip";
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn
} from "material-ui/Table";

import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

import TextField from "material-ui/TextField";
import Dialog from "material-ui/Dialog";

import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import AutoComplete from "material-ui/AutoComplete";

import strings from "../../localizeStrings";

const styles = {
  container: {
    padding: 0
  },
  dialog: {
    padding: 0
  },
  contentStyle: {
    width: "40%",
    maxWidth: "none"
  },
  tableBody: {
    height: "75px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

const AssigneesDialog = props => (
  <Dialog
    title={props.title}
    actions={[<FlatButton label="Close" primary={true} onClick={() => props.onClose()} />]}
    modal={true}
    open={props.show}
    autoScrollBodyContent={true}
    bodyStyle={styles.dialog}
    contentStyle={styles.contentStyle}
  >
    <div style={styles.container}>
      <AssigneesTable {...props} />
    </div>
  </Dialog>
);

const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Black", "White"];

const selectionStyle = {
  searchContainer: {
    marginLeft: "12px",
    marginRight: "12px"
  },
  selectionContainer: {}
};

const users = [
  {
    id: "thouse",
    displayName: "Tom House",
    organization: "Ministry of Health"
  },
  {
    id: "pkleffmann",
    displayName: "Piet Kleffmann",
    organization: "ACMECorp"
  },
  {
    id: "mstein",
    displayName: "Mauro Stein",
    organization: "UmbrellaCorp"
  },
  {
    id: "jdoe",
    displayName: "John Doe",
    organization: "Ministry of Finance"
  },
  {
    id: "jxavier",
    displayName: "Jane Xavier",
    organization: "Ministry of Education"
  },
  {
    id: "dviolin",
    displayName: "Dana Violin",
    organization: "Centralbank"
  },
  {
    id: "auditUser",
    displayName: "Romina Checker",
    organization: "Audit"
  }
];

class AssigneesTable extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      assignee: "Tom House"
    };
  }

  renderUsers(user) {
    return user.map(u => {
      return (
        <MenuItem
          key={u.id}
          checked={u.displayName === this.state.assignee}
          insetChildren={true}
          value={u.displayName}
          primaryText={u.displayName}
          onClick={() => this.setState({ assignee: u.displayName })}
        />
      );
    });
  }

  render() {
    const selection = this.renderUsers(
      users.filter(u => {
        return u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      })
    );
    return (
      <Table style={{ maxHeight: "250px" }} selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Assignee</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          <TableRow style={styles.tableBody}>
            <TableRowColumn>
              <SelectField
                multiple={true}
                hintText={this.state.assignee}
                maxHeight={250}
                autoWidth={true}
                dropDownMenuProps={{
                  onClose: () => this.setState({ searchTerm: "" })
                }}
              >
                <div style={selectionStyle.searchContainer}>
                  <TextField
                    fullWidth
                    hintText="Search"
                    onChange={e => this.setState({ searchTerm: e.target.value })}
                  />
                </div>
                <div style={selectionStyle.selectionContainer}>{selection}</div>
              </SelectField>
            </TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
}

export default AssigneesDialog;
