// import React, { Component } from "react";

// import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table";

// import SelectField from "material-ui/SelectField";
// import { MenuItem } from "material-ui/Menu";

// import TextField from "material-ui/TextField";
// import Dialog from "material-ui/Dialog";

// import Button from "material-ui/Button";

// const styles = {
//   container: {
//     padding: 0
//   },
//   dialog: {
//     padding: 0
//   },
//   contentStyle: {
//     width: "40%",
//     maxWidth: "none"
//   },
//   tableBody: {
//     height: "75px",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center"
//   }
// };

// const AssigneeDialog = ({ assigneeId, users, show, onClose, assign }) => {
//   return (
//     <Dialog
//       actions={[
//         <Button primary={true} onClick={() => onClose()}>
//           Close
//         </Button>
//       ]}
//       modal={true}
//       open={show}
//       autoScrollBodyContent={true}
//       bodyStyle={styles.dialog}
//       contentStyle={styles.contentStyle}
//     >
//       <div style={styles.container}>
//         <AssigneeTable assign={assign} assigneeId={assigneeId} users={users} />
//       </div>
//     </Dialog>
//   );
// };

// const selectionStyle = {
//   searchContainer: {
//     marginLeft: "12px",
//     marginRight: "12px"
//   },
//   selectionContainer: {}
// };

// class AssigneeTable extends Component {
//   constructor() {
//     super();
//     this.state = {
//       searchTerm: ""
//     };
//   }

//   renderUsers(users, assigneeId) {
//     return users.map(u => {
//       const { id, displayName } = u;
//       return (
//         <MenuItem
//           key={id}
//           checked={id === assigneeId}
//           insetChildren={true}
//           value={displayName}
//           primaryText={displayName}
//           onClick={() => this.props.assign(id)}
//         />
//       );
//     });
//   }

//   renderTitle(assignee) {
//     if (!assignee) {
//       return "...";
//     }
//     return assignee.displayName;
//   }

//   render() {
//     const { assigneeId, users } = this.props;
//     const selection = this.renderUsers(
//       users.filter(u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())),
//       assigneeId
//     );
//     const assignee = users.find(user => user.id === assigneeId);

//     return (
//       <Table style={{ maxHeight: "250px" }} selectable={false}>
//         <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
//           <TableRow>
//             <TableHeaderColumn>Assignee</TableHeaderColumn>
//           </TableRow>
//         </TableHeader>
//         <TableBody displayRowCheckbox={false}>
//           <TableRow style={styles.tableBody}>
//             <TableRowColumn>
//               <SelectField
//                 multiple={true}
//                 hintText={this.renderTitle(assignee)}
//                 maxHeight={250}
//                 autoWidth={true}
//                 dropDownMenuProps={{
//                   onClose: () => this.setState({ searchTerm: "" })
//                 }}
//               >
//                 <div style={selectionStyle.searchContainer}>
//                   <TextField
//                     fullWidth
//                     hintText="Search"
//                     onChange={e => this.setState({ searchTerm: e.target.value })}
//                   />
//                 </div>
//                 <div style={selectionStyle.selectionContainer}>{selection}</div>
//               </SelectField>
//             </TableRowColumn>
//           </TableRow>
//         </TableBody>
//       </Table>
//     );
//   }
// }

// TODO: update selectfield material v1
export default null;
