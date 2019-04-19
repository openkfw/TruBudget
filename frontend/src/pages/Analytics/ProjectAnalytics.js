import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { HorizontalBar } from "react-chartjs-2";
import { connect } from "react-redux";

import { toAmountString, toJS } from "../../helper";
import strings from "../../localizeStrings";
import { getProjectKPIs, resetKPIs, storeProjectCurrency } from "./actions";
import DropDown from "../Common/NewDropdown";
import { MenuItem, Typography, Button } from "@material-ui/core";

/**
 * ProjectAnalytics should provide a dashboard which visualizes aggregate informations about the selected Project
 * - Projected Budget: Planned budget according to agreements and other budget planning documents.
 * - Assigned Budget: "Calculation : Sum of assigned budgets of all subprojects (only of closed workflow items).
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments of project (only of closed workflow items). Not allowed to exceed assigned budget.
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
  },
  topContainer: {
    display: "flex",
    flexDirection: "column"
  }
};

const seperateOverflow = (amount, maxAmount) => {
  if (amount <= maxAmount) {
    return { amount, overflow: 0 };
  } else {
    const overflow = amount - maxAmount;
    return { amount: maxAmount, overflow };
  }
};

const getTotalChart = (props, totalBudget) => {
  const { assignedBudget = 0, disbursedBudget = 0, indicatedAssignedBudget = 0, indicatedDisbursedBudget = 0 } = props;
  const { amount: seperatedAssignedBudget, overflow: overAssignedBudget } = seperateOverflow(
    assignedBudget,
    disbursedBudget
  );
  const { amount: seperatedDisbursedBudget, overflow: overDisbursedBudget } = seperateOverflow(
    disbursedBudget,
    totalBudget
  );
  const { amount: seperatedIndicatedAssignedBudget, overflow: overAssignedIndicatedBudget } = seperateOverflow(
    indicatedAssignedBudget,
    indicatedDisbursedBudget
  );
  const { amount: seperatedIndicatedDisbursedBudget, overflow: overDisbursedIndicatedBudget } = seperateOverflow(
    indicatedDisbursedBudget,
    totalBudget
  );
  return (
    <div style={styles.charts}>
      <HorizontalBar
        data={{
          labels: ["Budget (closed Workflowitems)", "Budget (total)"],
          datasets: [
            {
              label: "Assigned",
              data: [seperatedAssignedBudget, seperatedIndicatedAssignedBudget],
              backgroundColor: "#FAEBCC", // yellow
              stack: "a"
            },
            {
              label: "Over-Assigned",
              data: [overAssignedBudget, overAssignedIndicatedBudget],
              backgroundColor: "#FF0000",
              stack: "a"
            },
            {
              label: "Disbursed",
              data: [seperatedDisbursedBudget, seperatedIndicatedDisbursedBudget],
              backgroundColor: "#EBCCD1", // red
              stack: "b"
            },
            {
              label: "Over-Disbursed",
              data: [overDisbursedBudget, overDisbursedIndicatedBudget],
              backgroundColor: "#FF0000",
              stack: "b"
            },
            {
              label: "Total",
              data: [totalBudget, totalBudget],
              backgroundColor: "#D6E9C6" // green
            }
          ]
        }}
        options={{
          tooltips: {
            callbacks: {
              label: (item, data) => {
                {
                  let label = data.datasets[item.datasetIndex].label || "";
                  if (data.datasets[item.datasetIndex].data[item.index] > 0) {
                    label +=
                      ": " +
                      data.datasets[item.datasetIndex].data[item.index]
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    return label;
                  }
                }
              }
            }
          },
          scales: {
            yAxes: [
              {
                id: "budgetOptions",
                type: "category",
                labels: ["Budget (closed Workflowitems)", "Budget (total)"],
                gridLines: { display: false },
                barPercentage: 0.9,
                categoryPercentage: 1,
                barThickness: 30
              }
            ],
            xAxes: [
              {
                id: "budgetAmount",
                afterBuildTicks: scale => {
                  scale.ticks.splice(scale.ticks.length - 1);
                },
                ticks: {
                  callback: (value, index, values) => {
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                  },
                  beginAtZero: true,
                  max: Math.max(totalBudget, indicatedAssignedBudget, indicatedDisbursedBudget)
                }
              }
            ]
          }
        }}
      />
    </div>
  );
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
    console.log(this.props.totalBudget);
    // console.log(this.props.projectedBudget);
    // console.log(projectedBudget);
    // console.log(assignedBudget);
    // console.log(disbursedBudget);
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
          {/* {totalBudget !== undefined && projectCurrency !== undefined ? getTotalChart(this.props, totalBudget) : null} */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    projectedBudgets: state.getIn(["analytics", "projectedBudgets"]),
    projectedBudget: state.getIn(["analytics", "projectedBudget"]),
    assignedBudget: state.getIn(["analytics", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "disbursedBudget"]),
    totalBudget: state.getIn(["analytics", "totalBudget"]),
    indicatedAssignedBudget: state.getIn(["analytics", "indicatedAssignedBudget"]),
    indicatedDisbursedBudget: state.getIn(["analytics", "indicatedDisbursedBudget"]),
    projectCurrency: state.getIn(["analytics", "projectCurrency"]),
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
