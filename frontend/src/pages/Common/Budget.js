import React, { useCallback, useEffect, useState } from "react";
import _isEmpty from "lodash/isEmpty";

import DoneIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import {
  fromAmountString,
  getCurrencies,
  numberSignsRegex,
  toAmountString,
  validateLanguagePattern
} from "../../helper";
import strings from "../../localizeStrings";

import DropDown from "./NewDropdown";

const styles = {
  inputfield: { minWidth: 200, marginRight: "16px", flexGrow: "1" },
  inputFieldWithIcon: { minWidth: 200, flexGrow: "1" },
  inputContainer: {
    display: "flex",
    width: "45%",
    paddingRight: 20,
    alignItems: "flex-end"
  },
  cell: { display: "flex", justifyContent: "space-between" },
  helpIcon: { color: "rgba(0,0, 0, 0.42)", marginTop: "20px", marginBottom: "7px", fontSize: "x-large" }
};

const CustomInfoTooltip = (props) => {
  const [open, setOpen] = useState(false);

  const handleTooltipOpen = () => {
    setOpen(true);
  };
  const handleTooltipClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        title={props.title}
        onOpen={handleTooltipOpen}
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
      >
        <InfoOutlinedIcon style={styles.helpIcon} onClick={handleTooltipOpen} />
      </Tooltip>
    </ClickAwayListener>
  );
};

const renderProjectedBudgetAmount = ({
  projectedBudget,
  currIndex,
  editIndex,
  isEditing,
  budgetAmountEdit,
  setBudgetAmountEdit,
  isValidBudgetAmountEdit,
  setIsValidBudgetAmountEdit
}) => {
  return (
    <TableCell align="right" data-test="saved-projected-budget-amount">
      {isEditing && editIndex === currIndex ? (
        <TextField
          variant="standard"
          label={strings.common.total_budget}
          value={budgetAmountEdit}
          onChange={(e) => {
            if (numberSignsRegex.test(e.target.value)) {
              setBudgetAmountEdit(e.target.value);
              setIsValidBudgetAmountEdit(validateLanguagePattern(e.target.value) || _isEmpty(e.target.value));
            }
          }}
          type="text"
          aria-label="projectedBudgetAmountEdit"
          id={`amountedit-${editIndex}`}
          data-test="edit-projected-budget-amount"
          error={!isValidBudgetAmountEdit}
          helperText={!isValidBudgetAmountEdit ? strings.common.invalid_format : ""}
        />
      ) : (
        toAmountString(projectedBudget.value, projectedBudget.currencyCode)
      )}
    </TableCell>
  );
};

const renderProjectedBudgetEditButtons = ({
  projectedBudget,
  currIndex,
  editIndex,
  isEditing,
  budgetAmountEdit,
  deletedProjectedBudgets,
  setEditIndex,
  setIsEditing,
  setBudgetAmountEdit,
  isValidBudgetAmountEdit,
  editProjectedBudget,
  storeDeletedProjectedBudget
}) => {
  return (
    <TableCell align="right">
      {isEditing && editIndex === currIndex ? (
        <Button
          aria-label="Done"
          onClick={() => {
            editProjectedBudget(projectedBudget, fromAmountString(budgetAmountEdit).toString(10));
            setEditIndex(-1);
            setIsEditing(false);
          }}
          disabled={!isValidBudgetAmountEdit}
          data-test="edit-projected-budget-amount-done"
        >
          <DoneIcon />
        </Button>
      ) : (
        <Button
          aria-label="Edit"
          onClick={() => {
            setEditIndex(currIndex);
            setIsEditing(true);
            setBudgetAmountEdit(toAmountString(projectedBudget.value).toString(10));
          }}
          disabled={isEditing}
          data-test="edit-projected-budget"
        >
          <EditIcon />
        </Button>
      )}
      <Button
        aria-label="Delete"
        onClick={() => storeDeletedProjectedBudget([...deletedProjectedBudgets, ...[projectedBudget]])}
        data-test="delete-projected-budget"
      >
        <DeleteIcon />
      </Button>
    </TableCell>
  );
};

const getOrganizationMenuItems = (projectedBudgets) => {
  // Get only unique organizations, ES6 syntax
  const distinctOrganizations = [
    ...new Set(
      projectedBudgets.map((budget) => {
        return budget.organization;
      })
    )
  ];
  return distinctOrganizations.map((organization) => {
    return (
      <MenuItem key={`budget-${organization}`} value={organization}>
        {organization}
      </MenuItem>
    );
  });
};

const getCurrencyMenuItems = (currencies) => {
  return currencies.map((currency) => {
    return (
      <MenuItem key={currency.primaryText} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
};

const Budget = (props) => {
  const [isSaveable, setIsSaveable] = useState(true);
  const [isValidBudgetAmountAdd, setIsValidBudgetAmountAdd] = useState(true);
  const [isValidBudgetAmountEdit, setIsValidBudgetAmountEdit] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [budgetAmountAdd, setBudgetAmountAdd] = useState("");
  const [budgetAmountEdit, setBudgetAmountEdit] = useState("");
  const [organization, setOrganization] = useState("");
  const [currency, setCurrency] = useState("");
  const currencies = getCurrencies();

  const {
    projectProjectedBudgets,
    projectedBudgets = [],
    deletedProjectedBudgets = [],
    addProjectedBudget,
    editProjectedBudget,
    storeDeletedProjectedBudget
  } = props;

  useEffect(() => {
    // Multiple budgets with the same organziation and currency are not valid
    const isValidBudget =
      _isEmpty(projectedBudgets) ||
      _isEmpty(organization) ||
      _isEmpty(currency) ||
      !projectedBudgets.some((x) => {
        return x.organization === organization && x.currencyCode === currency;
      });
    setIsSaveable(isValidBudget);
  }, [projectedBudgets, organization, currency]);

  const saveProjectedBudget = useCallback(() => {
    const projectedBudgetToAdd = {
      organization: organization,
      value: fromAmountString(budgetAmountAdd).toString(10),
      currencyCode: currency
    };
    addProjectedBudget(projectedBudgetToAdd);
    setBudgetAmountAdd("");
    setOrganization("");
    setCurrency("");
  }, [budgetAmountAdd, currency, organization, addProjectedBudget]);

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.organization}</TableCell>
            <TableCell align="right">{strings.common.total_budget}</TableCell>
            <TableCell align="right">{strings.common.actions}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody data-test="projected-budget-list">
          {projectedBudgets.map((projectedBudget, currIndex) => {
            return (
              <TableRow key={`pb-row-${projectedBudget.organization}-${projectedBudget.value}-${currIndex}`}>
                <TableCell>{projectedBudget.organization}</TableCell>
                {renderProjectedBudgetAmount({
                  projectedBudget,
                  currIndex,
                  editIndex,
                  isEditing,
                  budgetAmountEdit,
                  setBudgetAmountEdit,
                  isValidBudgetAmountEdit,
                  setIsValidBudgetAmountEdit
                })}
                {renderProjectedBudgetEditButtons({
                  projectedBudget,
                  currIndex,
                  editIndex,
                  isEditing,
                  budgetAmountEdit,
                  deletedProjectedBudgets,
                  setEditIndex,
                  setIsEditing,
                  setBudgetAmountEdit,
                  isValidBudgetAmountEdit,
                  editProjectedBudget,
                  storeDeletedProjectedBudget
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Table>
        <TableBody>
          <TableRow key={`pb-row-add`}>
            <TableCell>
              <div style={styles.cell}>
                {_isEmpty(projectProjectedBudgets) ? (
                  <>
                    <TextField
                      variant="standard"
                      style={styles.inputFieldWithIcon}
                      label={strings.common.organization}
                      value={organization}
                      onChange={(e) => {
                        setOrganization(e.target.value);
                      }}
                      type="text"
                      aria-label="organization"
                      id="organizationinput"
                      inputProps={{
                        "data-test": "organization-input"
                      }}
                      disabled={isEditing}
                    />
                    <CustomInfoTooltip title={strings.subproject.organization_info} />
                  </>
                ) : (
                  <div style={styles.inputContainer}>
                    <DropDown
                      style={styles.inputFieldWithIcon}
                      value={organization}
                      floatingLabel={strings.common.organization}
                      onChange={(e) => setOrganization(e)}
                      id="organizations"
                      disabled={isEditing}
                    >
                      {getOrganizationMenuItems(projectProjectedBudgets)}
                    </DropDown>
                    <CustomInfoTooltip title={strings.subproject.organization_info} />
                  </div>
                )}

                <DropDown
                  style={styles.inputfield}
                  value={currency}
                  floatingLabel={strings.common.currency}
                  onChange={(currency) => {
                    setCurrency(currency);
                  }}
                  id="currencies"
                  disabled={isEditing}
                  error={!isSaveable}
                  errorText={strings.common.projected_budget_exists}
                >
                  {getCurrencyMenuItems(currencies)}
                </DropDown>
                <TextField
                  variant="standard"
                  label={strings.common.total_budget}
                  data-test="projected-budget"
                  disabled={isEditing}
                  value={budgetAmountAdd}
                  onChange={(v) => {
                    if (numberSignsRegex.test(v.target.value)) {
                      setBudgetAmountAdd(v.target.value);
                      setIsValidBudgetAmountAdd(validateLanguagePattern(v.target.value) || _isEmpty(v.target.value));
                    }
                  }}
                  type="text"
                  multiline={false}
                  aria-label="projectedbudget"
                  id="projectedbudgetinput"
                  style={styles.inputFieldWithIcon}
                  error={!isValidBudgetAmountAdd}
                  helperText={!isValidBudgetAmountAdd ? strings.common.invalid_format : ""}
                />
                <CustomInfoTooltip title={strings.subproject.total_budget_info} />
              </div>
            </TableCell>
            <TableCell align="right">
              <Button
                variant="contained"
                color="secondary"
                data-test="add-projected-budget"
                disabled={!budgetAmountAdd || !currency || !organization || !isSaveable || !isValidBudgetAmountAdd}
                onClick={saveProjectedBudget}
              >
                {`${strings.common.add}`}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default Budget;
