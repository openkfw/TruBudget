import React from "react";
import Downshift from "downshift";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import UserIcon from "@material-ui/icons/Person";

const renderInput = inputProps => {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      style={{ width: 300 }}
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot
        },
        // eslint-disable-next-line no-useless-computed-key
        ["data-test"]: "autocomplete",
        ...InputProps
      }}
      {...other}
    />
  );
};

const renderSuggestion = ({ suggestion, index, itemProps, highlightedIndex, selectedItem }) => {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || "").indexOf(suggestion.id) > -1;
  return (
    <MenuItem
      {...itemProps}
      key={suggestion.id}
      selected={isHighlighted}
      data-test={`autocomplete-item-${index}`}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400
      }}
    >
      {suggestion.id}
    </MenuItem>
  );
};

const getSuggestions = (data, inputValue) => {
  let count = 0;

  return data.filter(suggestion => {
    const keep = (!inputValue || suggestion.id.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) && count < 5;

    if (keep) {
      count += 1;
    }

    return keep;
  });
};

const styles = theme => ({
  root: {
    height: 100
  },
  container: {
    position: "relative"
  },
  paper: {
    position: "absolute",
    zIndex: 10,
    width: "100%",
    heigth: 500,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`
  },
  inputRoot: {
    flexWrap: "wrap"
  },
  selection: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap"
  }
});

class AutoComplete extends React.Component {
  state = {
    inputValue: ""
  };

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleChange = (item, selectedItems, users, addToSelection) => {
    if (selectedItems.indexOf(item) === -1) {
      const user = users.find(user => user.id === item);
      addToSelection(user.id);
    }

    this.setState({
      inputValue: ""
    });
  };

  render() {
    const { classes, users, addToSelection, selectedItems, handleDelete } = this.props;
    const { inputValue } = this.state;

    return (
      <div style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              marginTop: "5px",
              marginRight: "20px"
            }}
          >
            <UserIcon />
          </div>
          <Downshift
            inputValue={inputValue}
            onChange={item => this.handleChange(item, selectedItems, users, addToSelection)}
            selectedItem={selectedItems}
            id="autoComplete"
          >
            {({
              getInputProps,
              getItemProps,
              isOpen,
              inputValue: inputValue2,
              selectedItem: selectedItem2,
              highlightedIndex
            }) => (
              <div className={classes.container}>
                {renderInput({
                  classes,
                  InputProps: getInputProps({
                    onChange: this.handleInputChange,
                    placeholder: selectedItems.length + " Users selected"
                  })
                })}
                {isOpen ? (
                  <Paper className={classes.paper} elevation={1} square>
                    {getSuggestions(users, inputValue2).map((suggestion, index) =>
                      renderSuggestion({
                        suggestion,
                        index,
                        itemProps: getItemProps({ item: suggestion.id }),
                        highlightedIndex,
                        selectedItem: selectedItem2
                      })
                    )}
                  </Paper>
                ) : null}
              </div>
            )}
          </Downshift>
        </div>
        <div className={classes.selection}>
          {selectedItems.map(item => (
            <Chip key={item} tabIndex={-1} label={item} className={classes.chip} onDelete={() => handleDelete(item)} />
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AutoComplete);
