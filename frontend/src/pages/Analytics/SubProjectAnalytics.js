import { TextField } from "@material-ui/core";
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
import { getSubProjectKPIs, resetKPIs, storeExchangeRate } from "./actions";

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

const seperateOverflow = (amount, maxAmount) => {
  if (amount <= maxAmount) {
    return { amount, overflow: 0 };
  } else {
    const overflow = amount - maxAmount;
    return { amount: maxAmount, overflow };
  }
};

const getTotalChart = (props, totalBudget) => {
  const {
    assignedBudget = 0,
    disbursedBudget = 0,
    subProjectCurrency = "EUR",
    indicatedAssignedBudget = 0,
    indicatedDisbursedBudget = 0
  } = props;
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
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
                      " " +
                      subProjectCurrency;
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
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " " + subProjectCurrency;
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

class SubprojectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getSubProjectKPIs(this.props.projectId, this.props.subProjectId);
  }
  componentWillUnmount() {
    this.props.resetKPIs();
  }
  render() {
    const { storeExchangeRate, projectedBudgets, subProjectCurrency = "EUR", totalBudget } = this.props;
    return (
      <div>
        <div style={styles.container}>
          <div style={styles.table}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Organization</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Currency</TableCell>
                  <TableCell>Exchange Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectedBudgets.map(budget => (
                  <TableRow key={budget.organization + budget.currencyCode}>
                    <TableCell>{budget.organization}</TableCell>
                    <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                    <TableCell align="right">{budget.currencyCode}</TableCell>
                    {budget.currencyCode !== subProjectCurrency ? (
                      <TableCell>
                        <TextField
                          label={strings.workflow.exchange_rate}
                          onChange={e => {
                            storeExchangeRate(budget.organization, budget.currencyCode, parseFloat(e.target.value));
                          }}
                          onBlur={e =>
                            storeExchangeRate(budget.organization, budget.currencyCode, parseFloat(e.target.value))
                          }
                          onFocus={e =>
                            storeExchangeRate(budget.organization, budget.currencyCode, parseFloat(e.target.value))
                          }
                          type="text"
                          aria-label="rate"
                          id="rateinput"
                        />
                      </TableCell>
                    ) : (
                      <TableCell>{1}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalBudget !== undefined ? getTotalChart(this.props, totalBudget) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    subProjectCurrency: state.getIn(["analytics", "subProjectCurrency"]),
    projectedBudgets: state.getIn(["analytics", "projectedBudgets"]),
    assignedBudget: state.getIn(["analytics", "budget", "allocatedCurrent"]),
    disbursedBudget: state.getIn(["analytics", "budget", "disbursedCurrent"]),
    totalBudget: state.getIn(["analytics", "totalBudget"]),
    indicatedAssignedBudget: state.getIn(["analytics", "budget", "allocatedPlaned"]),
    indicatedDisbursedBudget: state.getIn(["analytics", "budget", "disbursedPlaned"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSubProjectKPIs: (projectId, subprojectId) => dispatch(getSubProjectKPIs(projectId, subprojectId)),
    resetKPIs: () => dispatch(resetKPIs()),
    storeExchangeRate: (organization, currency, exchnageRate) =>
      dispatch(storeExchangeRate(organization, currency, exchnageRate))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubprojectAnalytics));
