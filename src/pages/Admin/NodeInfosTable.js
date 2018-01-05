import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import _ from 'lodash';


const styles = {
  container: {
    width: '100%',
    height: '700px',
    overflow: 'auto'
  },
}
const sortNodes = (nodes) => {
  const nodesArray = _.values(nodes);
  const sortedNodes = _.sortBy(nodesArray, ['organization'])
  return sortedNodes;
}

const getNodes = (nodes) => {
  const sortedNodes = sortNodes(nodes)
  return sortedNodes.map(node => {
    return (
      <TableRow key={ node.address }>
        <TableRowColumn>
          { node.organization }
        </TableRowColumn>
        <TableRowColumn>
          { node.country }
        </TableRowColumn>
        <TableRowColumn>
          { node.address }
        </TableRowColumn>
      </TableRow>
    )
  })
}

const NodeInfosTable = (props) => {
  const {nodeInformation} = props;
  const tableEntries = getNodes(nodeInformation);
  return (
    <div style={ styles.container }>
      <Table fixedHeader={ true } selectable={ false }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn>Organization</TableHeaderColumn>
            <TableHeaderColumn>Country</TableHeaderColumn>
            <TableHeaderColumn>Address</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={ false } adjustForCheckbox={ false }>
          { tableEntries }
        </TableBody>
      </Table>
    </div>

  )
}
export default NodeInfosTable;