import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { connect } from "react-redux";

import { toAmountString, toJS } from "../../helper";
import { getSubProjectKPIs, resetKPIs } from "./actions";

/**
 * SubprojectAnalytics should provide a dashboard which visualizes aggregate informations about the selected Subproject
 * - Projected Budget: Planned budget according to agreements and other budget planning documents.
 * - Assigned Budget: "Calculation : Sum of assigned budgets of subproject (only of closed workflow items).
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments of subproject (only of closed workflow items). Not allowed to exceed assigned budget.
 * - Indication Assigned Budget: Assigned budget / projected budget
 * - Indication Disbursed Budget:  Disbursed budget / assigned budget
 */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "-webkit-fill-available"
  },
  charts: {
    marginLeft: "20%",
    marginRight: "20%",
    marginBottom: "20%"
  },
  table: {
    width: "80%",
    margin: "auto"
  },
  statistics: {
    padding: "12px"
  }
};

class SubprojectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getSubProjectKPIs(this.props.projectId, this.props.subProjectId);
  }
  componentWillUnmount() {
    this.props.resetKPIs();
  }

  convertToSelectedCurrency(amount, sourceCurrency) {
    const sourceExchangeRate = this.props.exchangeRates[sourceCurrency];
    const targetExchangeRate = this.props.exchangeRates[this.props.subProjectCurrency];
    return sourceExchangeRate && targetExchangeRate ? targetExchangeRate / sourceExchangeRate * parseFloat(amount) : 0;
  }

  convertProjectedBudget() {
    return this.props.projectedBudgets.map(pb => {
      return {
        ...pb,
        convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
      };
    });
  }

  render() {
    const { exchangeRates, subProjectCurrency = "EUR", assignedBudget, disbursedBudget } = this.props;
    const projectedBudgets = this.convertProjectedBudget();
    const totalBudget = this.convertProjectedBudget().reduce((acc, next) => {
      return acc + next.convertedAmount;
    }, 0);
    return (
      <div>
        <div style={styles.container}>
          <div style={styles.topContainer}>
            <div style={styles.table}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Currency</TableCell>
                    <TableCell align="right">Exchange Rate</TableCell>
                    <TableCell align="right">Converted Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectedBudgets.map(budget => (
                    <TableRow key={budget.organization + budget.currencyCode}>
                      <TableCell>{budget.organization}</TableCell>
                      <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                      <TableCell align="right">{budget.currencyCode}</TableCell>
                      <TableCell align="right">
                        {exchangeRates[budget.currencyCode] ? exchangeRates[budget.currencyCode].toFixed(4) : 1}
                      </TableCell>
                      <TableCell align="right">{toAmountString(budget.convertedAmount, subProjectCurrency)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">{toAmountString(totalBudget)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div style={styles.table}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>TotalBudget</TableCell>
                    <TableCell align="right">Assigned Budget</TableCell>
                    <TableCell align="right">Disbursed Budget</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{toAmountString(totalBudget)}</TableCell>
                    <TableCell align="right">{toAmountString(assignedBudget)}</TableCell>
                    <TableCell align="right">{toAmountString(disbursedBudget)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    subProjectCurrency: state.getIn(["analytics", "subproject", "currency"]),
    projectedBudgets: state.getIn(["analytics", "subproject", "projectedBudgets"]),
    assignedBudget: state.getIn(["analytics", "subproject", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "subproject", "disbursedBudget"]),
    exchangeRates: state.getIn(["analytics", "exchangeRates"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSubProjectKPIs: (projectId, subprojectId) => dispatch(getSubProjectKPIs(projectId, subprojectId)),
    resetKPIs: () => dispatch(resetKPIs())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubprojectAnalytics));
