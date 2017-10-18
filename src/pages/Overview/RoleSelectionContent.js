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

class RoleSelectionContent extends Component {
  state = {
    searchText: '',
  }

  createChips = (selectedRoles) => selectedRoles.map((role, index) => {
    return (
      <Chip
        key={index}
        style={styles.chip}
        onRequestDelete={() => this.onRemoveChip(role)}
      >{role}</Chip>
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

  onRemoveChip = (role) => {
    this.props.removeSelection(role);
  }

  handleUpdateInput = (text) => {
    this.setState({
      searchText: text
    })
  }

  render = () => {
    const unSelectedDataSource = _.difference(this.props.dataSource, this.props.selections);
    return (
      <div style={styles.container}>
        <AutoComplete
          ref="autoComplete"
          aria-label="roleselection"
          floatingLabelText={strings.project.project_authority_organization_search}
          searchText={this.state.searchText}
          dataSource={unSelectedDataSource}
          onNewRequest={this.onSelect}
          onUpdateInput={this.handleUpdateInput}
          filter={AutoComplete.fuzzyFilter}
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
