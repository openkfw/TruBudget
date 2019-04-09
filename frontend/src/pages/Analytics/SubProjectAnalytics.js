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

import { getSubProjectKPIs, resetKPIs } from "./actions";
import { createDoughnutData, toJS, toAmountString } from "../../helper";

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

class SubprojectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getSubProjectKPIs(this.props.projectId, this.props.subProjectId);
  }
  componentWillUnmount() {
    this.props.resetKPIs();
  }
  render() {
    const { projectedBudgets = [], assignedBudget = 0, disbursedBudget = 0, subProjectCurrency = "EUR" } = this.props;
    const disbursementRate = assignedBudget ? disbursedBudget / assignedBudget * 100 : 0;
    return (
      <div style={styles.container}>
        <div style={styles.charts}>
          <div>
            <Doughnut
              data={createDoughnutData(["Assigned", "Disbursed"], [100 - disbursementRate, disbursementRate])}
              options={{
                tooltips: {
                  callbacks: {
                    label: (item, data) => {
                      console.log(item);
                      console.log(data);
                      return `${data.datasets[item.datasetIndex].data[item.index].toFixed(1)}%`;
                    }
                  }
                }
              }}
            />
          </div>
          <Paper>
            <div style={styles.statistics}>
              <Typography variant="overline">Assigned: {toAmountString(assignedBudget, subProjectCurrency)}</Typography>
              <Divider />
              <Typography variant="overline">
                Disbursed: {toAmountString(disbursedBudget, subProjectCurrency)}
              </Typography>
            </div>
          </Paper>
        </div>
        <div style={styles.table}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Currency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectedBudgets.map(budget => (
                <TableRow key={budget.organization + budget.currencyCode}>
                  <TableCell>{budget.organization}</TableCell>
                  <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                  <TableCell align="right">{budget.currencyCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    subProjectCurrency: state.getIn(["analytics", "subProjectCurrency"]),
    projectedBudgets: state.getIn(["analytics", "projectedBudgets"]),
    assignedBudget: state.getIn(["analytics", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "disbursedBudget"])
  };
};

const mapDispatchToProps = { getSubProjectKPIs, resetKPIs };

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubprojectAnalytics));
