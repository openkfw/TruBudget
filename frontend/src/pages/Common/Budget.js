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
import React from "react";

import { fromAmountString, getCurrencies, toAmountString } from "../../helper";
import strings from "../../localizeStrings";
import DropDown from "./NewDropdown";

const styles = {
  dropdown: { minWidth: 200, marginRight: "16px" },
  cell: { display: "flex" },
  textfield: { width: "60" }
};

export default class Budget extends React.Component {
  state = {
    budgetAmount: "",
    budgetAmountEdit: "",
    organization: "",
    currency: "",
    edit: false,
    editIndex: -1,
    isSaveable: true
  };

  getCurrencyMenuItems(currencies) {
    return currencies.map((currency, index) => {
      return (
        <MenuItem key={currency.primaryText} value={currency.value}>
          {currency.primaryText}
        </MenuItem>
      );
    });
  }

  getOrganizationMenuItems(projectedBudgets) {
    // Get only unique organizations, ES6 syntax
    const distinctOrganizations = [
      ...new Set(
        projectedBudgets.map(budget => {
          return budget.organization;
        })
      )
    ];

    return distinctOrganizations.map((organization, index) => {
      return (
        <MenuItem key={`budget-${organization}`} value={organization}>
          {organization}
        </MenuItem>
      );
    });
  }

  deleteBudgetFromList(projectedBudgets, deletedProjectedBudgets, budgetToDelete) {
    this.props.storeDeletedProjectedBudget(this.addBudget(deletedProjectedBudgets, budgetToDelete));
    this.setCurrency(this.state.currency);
    this.setOrganization(this.state.organization);
  }

  updateSavable(organization, currency) {
    const isSaveable = !this.props.projectedBudgets.some(
      x => x.organization === organization && x.currencyCode === currency
    );

    if (
      this.state.isSaveable !== isSaveable ||
      this.state.organization !== organization ||
      this.state.currency !== currency
    ) {
      this.setState({
        organization: organization,
        currency: currency,
        isSaveable
      });
    }
  }
  setOrganization(organization) {
    this.updateSavable(organization, this.state.currency);
  }

  setCurrency(currency) {
    this.updateSavable(this.state.organization, currency);
  }

  editProjectedBudget(budgets, budget, budgetAmountEdit) {
    const updateIndex = budgets.findIndex(
      x => x.organization === budget.organization && x.currencyCode === budget.currencyCode
    );

    budgets[updateIndex].value = budgetAmountEdit;
    this.props.storeProjectedBudget(budgets);
    this.setState({
      edit: false,
      editIndex: -1
    });
  }

  addBudget(budgets, budgetToAdd) {
    budgets.push(budgetToAdd);
    return budgets;
  }

  render() {
    this.updateSavable(this.state.organization, this.state.currency);
    const {
      projectProjectedBudgets,
      projectedBudgets = [],
      deletedProjectedBudgets = [],
      storeProjectedBudget
    } = this.props;
    const currencies = getCurrencies();
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{strings.common.organization}</TableCell>
              <TableCell align="right">{strings.common.projected_budget}</TableCell>
              <TableCell align="right">{strings.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-test="projected-budget-list">
            {projectedBudgets.map((budget, i) => (
              <TableRow key={`pb-row-${budget.organization}-${budget.value}-${i}`}>
                <TableCell>{budget.organization}</TableCell>
                <TableCell align="right" data-test="saved-projected-budget-amount">
                  {this.state.edit && this.state.editIndex === i ? (
                    <TextField
                      label={strings.common.projected_budget}
                      value={this.state.budgetAmountEdit}
                      onChange={e => this.setState({ budgetAmountEdit: e.target.value })}
                      type="text"
                      aria-label="projectedBudgetAmountEdit"
                      id="amountedit"
                      data-test="edit-projected-budget-amount"
                    />
                  ) : (
                    toAmountString(budget.value, budget.currencyCode)
                  )}
                </TableCell>
                <TableCell align="right">
                  {this.state.edit && this.state.editIndex === i ? (
                    <Button
                      aria-label="Done"
                      onClick={() => this.editProjectedBudget(projectedBudgets, budget, this.state.budgetAmountEdit)}
                      data-test="edit-projected-budget-amount-done"
                    >
                      <DoneIcon />
                    </Button>
                  ) : (
                    <Button
                      aria-label="Edit"
                      onClick={() => this.setState({ editIndex: i, edit: true, budgetAmountEdit: budget.value })}
                      disabled={this.state.edit}
                      data-test="edit-projected-budget"
                    >
                      <EditIcon />
                    </Button>
                  )}
                  <Button
                    aria-label="Delete"
                    onClick={() => this.deleteBudgetFromList(projectedBudgets, deletedProjectedBudgets, budget)}
                    data-test="delete-projected-budget"
                  >
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow key={`pb-row-add`}>
              <TableCell>
                {projectProjectedBudgets !== undefined ? (
                  <DropDown
                    style={styles.dropdown}
                    value={this.state.organization}
                    floatingLabel={strings.common.organization}
                    onChange={e => this.setOrganization(e)}
                    id="organizations"
                    disabled={this.state.edit || projectProjectedBudgets.length === 0}
                  >
                    {this.getOrganizationMenuItems(projectProjectedBudgets)}
                  </DropDown>
                ) : (
                  <TextField
                    label={strings.common.organization}
                    value={this.state.organization}
                    onChange={e => this.setOrganization(e.target.value)}
                    type="text"
                    aria-label="organization"
                    id="organizationinput"
                    inputProps={{
                      "data-test": "organizationinput"
                    }}
                    disabled={this.state.edit}
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <div style={styles.cell}>
                  <DropDown
                    style={styles.dropdown}
                    value={this.state.currency}
                    floatingLabel={strings.common.currency}
                    onChange={e => this.setCurrency(e)}
                    id="currencies"
                    disabled={
                      this.state.edit || (projectProjectedBudgets !== undefined && projectProjectedBudgets.length === 0)
                    }
                    error={!this.state.isSaveable}
                    errorText={strings.common.projected_budget_exists}
                  >
                    {this.getCurrencyMenuItems(currencies)}
                  </DropDown>
                  <TextField
                    label={strings.common.projected_budget}
                    data-test="projected-budget"
                    disabled={
                      this.state.edit || (projectProjectedBudgets !== undefined && projectProjectedBudgets.length === 0)
                    }
                    value={this.state.budgetAmount}
                    onChange={v => {
                      if (/^[0-9,.-]*$/.test(v.target.value)) this.setState({ budgetAmount: v.target.value });
                    }}
                    onBlur={e => this.setState({ budgetAmount: toAmountString(e.target.value) })}
                    onFocus={() => this.setState({ budgetAmount: fromAmountString(this.state.budgetAmount) })}
                    type="text"
                    multiline={false}
                    aria-label="projectedbudget"
                    id="projectedbudgetinput"
                    style={styles.textfield}
                  />
                </div>
              </TableCell>
              <TableCell align="right">
                {
                  <Button
                    variant="contained"
                    color="secondary"
                    data-test="add-projected-budget"
                    disabled={
                      !this.state.budgetAmount ||
                      !this.state.currency ||
                      !this.state.organization ||
                      !this.state.isSaveable
                    }
                    onClick={() => {
                      this.setState({ edit: false });
                      const projectedBudgetsCopy = projectedBudgets;
                      projectedBudgetsCopy.push({
                        value: fromAmountString(this.state.budgetAmount).toString(10),
                        currencyCode: this.state.currency,
                        organization: this.state.organization
                      });
                      storeProjectedBudget(projectedBudgetsCopy);
                      this.setState({
                        budgetAmount: "",
                        organization: "",
                        currency: ""
                      });
                    }}
                  >
                    {`${strings.common.add}`}
                  </Button>
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}
