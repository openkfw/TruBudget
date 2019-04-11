import React from "react";
import { connect } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

import { getSubProjectKPIs, resetKPIs, storeExchangeRate } from "./actions";
import { createDoughnutData, toJS, toAmountString } from "../../helper";
import { TextField } from "@material-ui/core";
import strings from "../../localizeStrings";

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
    justifyContent: "space-around"
  },
  charts: {
    display: "flex",
    flexDirection: "column"
  },
  table: {
    display: "flex",
    flexDirection: "column"
  },
  statistics: {
    padding: "12px"
  }
};

const getChartsPerProjectedBudget = props => {
  const { projectedBudgets = [], assignedBudget = 0, disbursedBudget = 0, subProjectCurrency = "EUR" } = props;
  return projectedBudgets.map(budget => {
    const disbursementRate = disbursedBudget ? disbursedBudget / budget.value * 100 : 0;
    const assignmentRate = assignedBudget ? assignedBudget / budget.value * 100 : 0;
    return (
      <div style={styles.charts} key={"chart_" + budget.organization + "_" + budget.currencyCode}>
        <div>
          <Doughnut
            data={createDoughnutData(["Assigned", "Disbursed"], [assignmentRate, disbursementRate])}
            options={{
              tooltips: {
                callbacks: {
                  label: (item, data) => {
                    return `${data.datasets[item.datasetIndex].data[item.index].toFixed(1)}%`;
                  }
                }
              }
            }}
          />
        </div>
        <Paper>
          <div style={styles.statistics}>
            <Typography variant="overline">Currency: {budget.currencyCode}</Typography>
            <Divider />
            <Typography variant="overline">Assigned: {toAmountString(assignedBudget, subProjectCurrency)}</Typography>
            <Divider />
            <Typography variant="overline">Disbursed: {toAmountString(disbursedBudget, subProjectCurrency)}</Typography>
          </div>
        </Paper>
      </div>
    );
  });
};

const getTotalChart = (props, totalBudget) => {
  const { assignedBudget = 0, disbursedBudget = 0, subProjectCurrency = "EUR" } = props;
  const disbursementRate = disbursedBudget ? disbursedBudget / totalBudget * 100 : 0;
  const assignmentRate = assignedBudget ? assignedBudget / totalBudget * 100 : 0;
  return (
    <div style={styles.charts}>
      <div>
        <Doughnut
          data={createDoughnutData(["Assigned", "Not Assigned"], [assignmentRate, 100 - assignmentRate])}
          options={{
            tooltips: {
              callbacks: {
                label: (item, data) => {
                  return `${data.datasets[item.datasetIndex].data[item.index].toFixed(1)}%`;
                }
              }
            }
          }}
        />
        <Paper>
          <div style={styles.statistics}>
            <Typography variant="overline">Assigned: {toAmountString(assignedBudget, subProjectCurrency)}</Typography>
            <Divider />
            <Typography variant="overline">Total: {toAmountString(totalBudget, subProjectCurrency)}</Typography>
          </div>
        </Paper>
      </div>
      <div>
        <Doughnut
          data={createDoughnutData(["Disbursed", "Not Disbursed"], [disbursementRate, 100 - disbursementRate])}
          options={{
            tooltips: {
              callbacks: {
                label: (item, data) => {
                  return `${data.datasets[item.datasetIndex].data[item.index].toFixed(1)}%`;
                }
              }
            }
          }}
        />
        <Paper>
          <div style={styles.statistics}>
            <Typography variant="overline">Disbursed: {toAmountString(disbursedBudget, subProjectCurrency)}</Typography>
            <Divider />
            <Typography variant="overline">Total: {toAmountString(totalBudget, subProjectCurrency)}</Typography>
          </div>
        </Paper>
      </div>
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
          {totalBudget !== undefined ? getTotalChart(this.props, totalBudget) : null}
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
                      <TableCell align="right" />
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div style={{ ...styles.container, marginTop: "80px" }}>{/* {renderBars(projectedBudgets)} */}</div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    subProjectCurrency: state.getIn(["analytics", "subProjectCurrency"]),
    projectedBudgets: state.getIn(["analytics", "projectedBudgets"]),
    assignedBudget: state.getIn(["analytics", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "disbursedBudget"]),
    totalBudget: state.getIn(["analytics", "totalBudget"])
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
