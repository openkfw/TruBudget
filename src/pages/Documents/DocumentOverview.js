import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import FingerPrint from 'material-ui/svg-icons/action/fingerprint';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import _ from 'lodash';

const styles = {
  uploadButton: {
    verticalAlign: 'middle',
  },
  uploadInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  hashButton: {
    cursor: 'default'
  }
};

const generateUploadIcon = () => (
  <FlatButton
    label="Validate"
    labelPosition="before"
    style={styles.uploadButton}
    containerElement="label"
  >
    <input type="file" style={styles.uploadInput} />
  </FlatButton>
)

const generateHashIcon = (hash) => (
  <FlatButton
    label={`${hash.slice(0, 5)}...`}
    labelPosition="after"
    style={styles.hashButton}
    disableTouchRipple={true}
    hoverColor='none'
    icon={<FingerPrint />}
  />
)

const generateDocumentList = (documents) => documents.map((document, index) => {
  const { name, hash } = document;
  console.log(document)
  return (
    <TableRow key={index + 'document'} selectable={false}>
      <TableRowColumn>{generateHashIcon(hash)}</TableRowColumn>
      <TableRowColumn>{name}</TableRowColumn>
      <TableRowColumn>{generateUploadIcon()}</TableRowColumn>
    </TableRow>
  )
})

const generateEmptyList = () => (
  <TableRow selectable={false}>
    <TableRowColumn>No documents</TableRowColumn>
  </TableRow>
)

const DocumentOverview = (props) => {
  const { documents } = props;
  return (
    <Table selectable={false}>
      <TableBody displayRowCheckbox={false}>
        {_.isEmpty(documents) ? generateEmptyList() : generateDocumentList(documents)}
      </TableBody>
    </Table>
  )
}

export default DocumentOverview;
