import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import _ from 'lodash';


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
    selectedRoles: [],
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
        selectedRoles: _.uniq([...this.state.selectedRoles, role]),
        searchText: '',
      });
    }
  }

  onRemoveChip = (role) => {
    this.setState({
      selectedRoles: _.pull(this.state.selectedRoles, role)
    });
  }

  handleUpdateInput = (text) => {
    this.setState({
      searchText: text
    })
  }

  render = () => {
    const unSelectedDataSource = _.difference(this.props.dataSource, this.state.selectedRoles);
    return (
      <div style={styles.container}>
        <AutoComplete
          ref="autoComplete"
          floatingLabelText="Search organizations"
          searchText={this.state.searchText}
          dataSource={unSelectedDataSource}
          onNewRequest={this.onSelect}
          onUpdateInput={this.handleUpdateInput}
          filter={AutoComplete.fuzzyFilter}
          menuCloseDelay={0}
        />
        <div style={styles.chipWrapper}>
          {this.createChips(this.state.selectedRoles)}
        </div>
      </div >
    )
  }
}

export default RoleSelectionContent;
