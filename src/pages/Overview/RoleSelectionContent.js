import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import _ from 'lodash';
import strings from '../../localizeStrings'

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
  chip: {
    margin: '4px',
    height: '32px'
  },
  chipWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
}

const dataSourceConfig = {
  text: 'displayName',
  value: 'role',
};

class RoleSelectionContent extends Component {
  state = {
    searchText: '',
  }

  createChips = (selectedRoles) => selectedRoles.map((role, index) => {

    return (
      <Chip
        key={index}
        style={styles.chip}
        onRequestDelete={() => this.onRemoveChip(index)}
      >{role.displayName}</Chip>
    )
  })

  onSelect = (role, index) => {
    if (index > -1) {
      this.setState({
        searchText: '',
      });
      this.props.addSelection(role);
    }
  }

  captureEnterClick = (event) => {
    if (event.charCode === 13) {
      const unSelectedDataSource = _.differenceBy(this.props.dataSource, this.props.selections, 'role');
      const index = unSelectedDataSource.findIndex((role) => role.role.toLowerCase() === _.trim(this.state.searchText).toLowerCase())
      if (index > -1) {
        const role = unSelectedDataSource[index];
        this.onSelect(role, index);
      }
    }
  }

  onRemoveChip = (index) => {
    this.props.removeSelection(index);
  }

  handleUpdateInput = (text) => {
    this.setState({
      searchText: text
    })
  }

  render = () => {

    const unSelectedDataSource = _.differenceBy(this.props.dataSource, this.props.selections, 'role');
    return (
      <div style={styles.container}>
        <AutoComplete
          ref="autoComplete"
          aria-label="roleselection"
          onKeyPress={this.captureEnterClick}
          floatingLabelText={strings.project.project_authority_role_search}
          searchText={this.state.searchText}
          dataSource={unSelectedDataSource}
          onNewRequest={this.onSelect}
          onUpdateInput={this.handleUpdateInput}
          filter={AutoComplete.fuzzyFilter}
          dataSourceConfig={dataSourceConfig}
          menuCloseDelay={0}
        />
        <div style={styles.chipWrapper}>
          {this.createChips(this.props.selections)}
        </div>
      </div >
    )
  }
}

export default RoleSelectionContent;
