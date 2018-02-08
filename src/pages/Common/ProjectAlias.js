import React, { Component } from 'react';
import TextInput from './TextInput';

const styles = {
  inputDiv: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
}

class ProjectAlias extends Component {

  render() {
    return (
      <div style={styles.inputDiv} >
        <TextInput floatingLabelText={this.props.nameLabel}
          hintText={this.props.nameHintText}
          value={this.props.name}
          onChange={this.props.nameOnChange}
          aria-label='nameinput'
        />
        <TextInput
          floatingLabelText={this.props.commentLabel}
          hintText={this.props.commentHintText}
          value={this.props.comment}
          onChange={this.props.commentOnChange}
          multiLine={true}
          aria-label='commentinput'
        />
      </div>
    )
  }
}

export default ProjectAlias;
