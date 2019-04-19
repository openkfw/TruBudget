import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { connect } from "react-redux";

import { toAmountString, toJS } from "../../helper";
import { getProjectKPIs, resetKPIs } from "./actions";

/**
 * ProjectAnalytics should provide a dashboard which visualizes aggregate informations about the selected Project
 * - Total Budget: Sum of projected budgets
 * - Projected Budget: Sum of projected budgets of all subprojects
 * - Assigned Budget: Sum of allocated budgets of all subprojects.
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments(disbursed budgets) of project (only of closed workflow items). Not allowed to exceed assigned budget.
 * - Indication Assigned Budget: Assigned budget / projected budget
 * - Indication Disbursed Budget:  Disbursed budget / assigned budget
 */

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "-webkit-fill-available"
  },
  table: {
    width: "80%",
    margin: "auto"
  },
  topContainer: {
    display: "flex",
    flexDirection: "column"
  }
};

class ProjectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getProjectKPIs(this.props.projectId);
  }
  componentWillUnmount() {
    this.props.resetKPIs();
  }

  convertToSelectedCurrency(amount, sourceCurrency) {
    const sourceExchangeRate = this.props.exchangeRates[sourceCurrency];
    const targetExchangeRate = this.props.exchangeRates[this.props.projectCurrency];
    return sourceExchangeRate && targetExchangeRate ? targetExchangeRate / sourceExchangeRate * parseFloat(amount) : 0;
  }

  convertTotalBudget() {
    return this.props.totalBudget.map(pb => {
      return {
        ...pb,
        convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
      };
    });
  }
  convertProjectedBudget() {
    return this.props.projectedBudget.map(pb =>
      pb.map(pb => {
        return {
          ...pb,
          convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
        };
      })
    );
  }

  render() {
    const { projectCurrency, exchangeRates } = this.props;
    const convertedTotalBudget = this.convertTotalBudget();
    const totalBudget = this.convertTotalBudget().reduce((acc, next) => {
      return acc + next.convertedAmount;
    }, 0);
    const projectedBudget = this.convertProjectedBudget().reduce((acc, next) => {
      return (
        acc +
        next.reduce((acc, next) => {
          return acc + next.convertedAmount;
        }, 0)
      );
    }, 0);
    const assignedBudget = this.props.assignedBudget.reduce((acc, next) => {
      return acc + this.convertToSelectedCurrency(next.budget, next.currency);
    }, 0);
    const disbursedBudget = this.props.disbursedBudget.reduce((acc, next) => {
      return acc + this.convertToSelectedCurrency(next.budget, next.currency);
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
                  {convertedTotalBudget.map(budget => (
                    <TableRow key={budget.organization + budget.currencyCode}>
                      <TableCell>{budget.organization}</TableCell>
                      <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                      <TableCell align="right">{budget.currencyCode}</TableCell>
                      <TableCell align="right">
                        {exchangeRates[budget.currencyCode] ? exchangeRates[budget.currencyCode].toFixed(4) : 1}
                      </TableCell>
                      <TableCell align="right">{toAmountString(budget.convertedAmount, projectCurrency)}</TableCell>
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
                    <TableCell align="right">Projected Budget</TableCell>
                    <TableCell align="right">Assigned Budget</TableCell>
                    <TableCell align="right">Disbursed Budget</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{toAmountString(totalBudget)}</TableCell>
                    <TableCell align="right">{toAmountString(projectedBudget)}</TableCell>
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
    projectedBudget: state.getIn(["analytics", "project", "projectedBudget"]),
    assignedBudget: state.getIn(["analytics", "project", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "project", "disbursedBudget"]),
    totalBudget: state.getIn(["analytics", "project", "totalBudget"]),
    projectCurrency: state.getIn(["analytics", "project", "currency"]),
    exchangeRates: state.getIn(["analytics", "exchangeRates"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getProjectKPIs: projectId => dispatch(getProjectKPIs(projectId)),
    resetKPIs: () => dispatch(resetKPIs())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectAnalytics));
