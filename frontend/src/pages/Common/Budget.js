import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import DoneIcon from "@material-ui/icons/Check";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import _isEmpty from "lodash/isEmpty";
import React, { useState, useEffect, useCallback } from "react";
import {
  fromAmountString,
  getCurrencies,
  toAmountString,
  validateLanguagePattern,
  numberSignsRegex
} from "../../helper";
import strings from "../../localizeStrings";
import DropDown from "./NewDropdown";

const styles = {
  inputfield: { minWidth: 200, marginRight: "16px", flexGrow: "1" },
  cell: { display: "flex", justifyContent: "space-between" }
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
          label={strings.common.total_budget}
          value={budgetAmountEdit}
          onChange={e => {
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

const getOrganizationMenuItems = projectedBudgets => {
  // Get only unique organizations, ES6 syntax
  const distinctOrganizations = [
    ...new Set(
      projectedBudgets.map(budget => {
        return budget.organization;
      })
    )
  ];
  return distinctOrganizations.map(organization => {
    return (
      <MenuItem key={`budget-${organization}`} value={organization}>
        {organization}
      </MenuItem>
    );
  });
};

const getCurrencyMenuItems = currencies => {
  return currencies.map(currency => {
    return (
      <MenuItem key={currency.primaryText} value={currency.value}>
        {currency.primaryText}
      </MenuItem>
    );
  });
};

const renderAddProjectedBudget = ({
  projectProjectedBudgets,
  organization,
  setOrganization,
  currency,
  setCurrency,
  isEditing,
  isSaveable,
  currencies,
  setBudgetAmountAdd,
  budgetAmountAdd,
  setIsValidBudgetAmountAdd,
  isValidBudgetAmountAdd,
  styles
}) => {
  return (
    <div style={styles.cell}>
      {_isEmpty(projectProjectedBudgets) ? (
        <TextField
          style={styles.inputfield}
          label={strings.common.organization}
          value={organization}
          onChange={e => {
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
      ) : (
        <DropDown
          style={styles.inputfield}
          value={organization}
          floatingLabel={strings.common.organization}
          onChange={e => setOrganization(e)}
          id="organizations"
          disabled={isEditing}
        >
          {getOrganizationMenuItems(projectProjectedBudgets)}
        </DropDown>
      )}

      <DropDown
        style={styles.inputfield}
        value={currency}
        floatingLabel={strings.common.currency}
        onChange={currency => {
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
        label={strings.common.total_budget}
        data-test="projected-budget"
        disabled={isEditing}
        value={budgetAmountAdd}
        onChange={v => {
          if (numberSignsRegex.test(v.target.value)) {
            setBudgetAmountAdd(v.target.value);
            setIsValidBudgetAmountAdd(validateLanguagePattern(v.target.value) || _isEmpty(v.target.value));
          }
        }}
        type="text"
        multiline={false}
        aria-label="projectedbudget"
        id="projectedbudgetinput"
        style={styles.inputfield}
        error={!isValidBudgetAmountAdd}
        helperText={!isValidBudgetAmountAdd ? strings.common.invalid_format : ""}
      />
    </div>
  );
};

const Budget = props => {
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
      !projectedBudgets.some(x => {
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
              {renderAddProjectedBudget({
                projectProjectedBudgets,
                organization,
                setOrganization,
                currency,
                setCurrency,
                isEditing,
                isSaveable,
                currencies,
                setBudgetAmountAdd,
                budgetAmountAdd,
                setIsValidBudgetAmountAdd,
                isValidBudgetAmountAdd,
                styles
              })}
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
