import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import DropDown from "./NewDropdown";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import MenuItem from "@material-ui/core/MenuItem";
import strings from "../../localizeStrings";

import { toAmountString, fromAmountString, getCurrencies } from "../../helper";

export default class Budget extends React.Component {
  state = {
    budgetAmount: "",
    organization: "",
    currency: ""
  };
  getMenuItems(currencies) {
    return currencies.map((currency, index) => {
      return (
        <MenuItem key={index} value={currency.value}>
          {currency.primaryText}
        </MenuItem>
      );
    });
  }

  render() {
    const { projectedBudgets = [], currencyTitle, parentCurrency, budgetLabel, addProjectedBudget } = this.props;
    const currencies = getCurrencies(parentCurrency);
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell align="right">Projected Budget</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectedBudgets.map((row, i) => (
              <TableRow key={`pb-row-${row.organization}-${row.value}`}>
                <TableCell>{row.organization}</TableCell>
                <TableCell align="right">{toAmountString(row.value, row.currencyCode)}</TableCell>
                <TableCell align="right">{}</TableCell>
              </TableRow>
            ))}
            <TableRow key={`pb-row-add`}>
              <TableCell>
                <TextField
                  label={strings.users.organization}
                  value={this.state.organization}
                  onChange={e => this.setState({ organization: e.target.value })}
                  type="text"
                  aria-label="organization"
                  id="organizationinput"
                />
              </TableCell>
              <TableCell align="right">
                <div style={{ display: "flex" }}>
                  <DropDown
                    style={{ minWidth: 200, marginRight: "16px" }}
                    value={this.state.currency}
                    floatingLabel={strings.project.project_currency}
                    onChange={e => this.setState({ currency: e })}
                    id="currencies"
                  >
                    {this.getMenuItems(currencies)}
                  </DropDown>
                  <TextField
                    label={strings.common.projectedBudget}
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
                    style={{
                      width: "60%"
                    }}
                  />
                </div>
              </TableCell>
              <TableCell align="right">
                {
                  <Button
                    variant="contained"
                    color="secondary"
                    disabled={!this.state.budgetAmount || !this.state.currency || !this.state.organization}
                    onClick={() => {
                      addProjectedBudget({
                        value: fromAmountString(this.state.budgetAmount).toString(10),
                        currencyCode: this.state.currency,
                        organization: this.state.organization
                      });
                      this.setState({
                        budgetAmount: "",
                        organization: "",
                        currency: ""
                      });
                    }}
                  >
                    {strings.common.add}
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
