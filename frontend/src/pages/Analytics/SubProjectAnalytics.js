import React from "react";
import { Doughnut } from "react-chartjs-2";
import { connect } from "react-redux";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import "chart.js/auto";

import { toAmountString, toJS } from "../../helper";
import strings from "../../localizeStrings";

import { getSubProjectKPIs, resetKPIs } from "./actions";

import "./index.scss";
/**
 * SubprojectAnalytics should provide a dashboard which visualizes aggregate informations about the selected Subproject
 * - Projected Budget: Planned budget according to agreements and other budget planning documents.
 * - Assigned Budget: "Calculation : Sum of assigned budgets of subproject (only of closed workflow items).
 *   May exceed (projected) budget (subproject) Definition : Budget reserved for one specific activity as fixed in contract with subcontrator."
 * - Disbursed Budget: Sum of payments of subproject (only of closed workflow items). Not allowed to exceed assigned budget.
 * - Indication Assigned Budget: Assigned budget / projected budget
 * - Indication Disbursed Budget:  Disbursed budget / assigned budget
 */

class SubprojectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getSubProjectKPIs(this.props.projectId, this.props.subProjectId);
    this.props.getExchangeRates(this.props.indicatedCurrency);
  }

  componentWillUnmount() {
    this.props.resetKPIs();
  }

  convertToSelectedCurrency(amount, sourceCurrency) {
    const sourceExchangeRate = this.props.exchangeRates[sourceCurrency];
    const targetExchangeRate = this.props.exchangeRates[this.props.indicatedCurrency];
    return sourceExchangeRate && targetExchangeRate
      ? (targetExchangeRate / sourceExchangeRate) * parseFloat(amount)
      : 0;
  }

  convertProjectedBudget() {
    return this.props.projectedBudgets.map((pb) => {
      return {
        ...pb,
        convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
      };
    });
  }

  render() {
    const { subProjectCurrency = "EUR", assignedBudget, disbursedBudget, indicatedCurrency } = this.props;
    const projectedBudgets = this.convertProjectedBudget();
    const projectedBudget = projectedBudgets.reduce((acc, next) => {
      return acc + next.convertedAmount;
    }, 0);
    const convertedAssignedBudget = this.convertToSelectedCurrency(assignedBudget, subProjectCurrency);
    const convertedDisbursedBudget = this.convertToSelectedCurrency(disbursedBudget, subProjectCurrency);
    return !this.props.isFetchingKPIs ? (
      <>
        <div className="container">
          <div className="top-container">
            <div className="table">
              <Table data-test="projected-budget-table">
                <TableHead>
                  <TableRow>
                    <TableCell>{strings.common.organization}</TableCell>
                    <TableCell align="right">{strings.amount}</TableCell>
                    <TableCell align="right">{strings.common.currency}</TableCell>
                    <TableCell align="right">{strings.workflow.exchange_rate}</TableCell>
                    <TableCell align="right">{strings.analytics.convertedAmount}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectedBudgets.map((budget) => (
                    <TableRow key={budget.organization + budget.currencyCode}>
                      <TableCell>{budget.organization}</TableCell>
                      <TableCell align="right">{toAmountString(budget.value)}</TableCell>
                      <TableCell align="right">{budget.currencyCode}</TableCell>
                      <TableCell align="right">
                        {this.convertToSelectedCurrency(1, budget.currencyCode).toFixed(4)}
                      </TableCell>
                      <TableCell align="right">{toAmountString(budget.convertedAmount, indicatedCurrency)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">{strings.analytics.total}</TableCell>
                    <TableCell data-test="table-total-budget" align="right">
                      {toAmountString(projectedBudget, indicatedCurrency)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          {this.props.canShowAnalytics ? (
            <Dashboard
              indicatedCurrency={this.props.indicatedCurrency}
              projectedBudget={projectedBudget}
              projectedBudgets={projectedBudgets}
              disbursedBudget={convertedDisbursedBudget}
              assignedBudget={convertedAssignedBudget}
            />
          ) : (
            <Typography className="warning" data-test="redacted-warning">
              {strings.analytics.insufficient_permissions_text}
            </Typography>
          )}
        </div>
      </>
    ) : null;
  }
}

const NumberChart = ({ title, budget, currency, dataTest }) => (
  <Card className="card">
    <CardContent className="number-content">
      <Typography variant="overline">{title}</Typography>
      <Typography data-test={dataTest} variant="h6">
        {toAmountString(budget, currency)}
      </Typography>
    </CardContent>
  </Card>
);
const RatioChart = ({ title, budget, dataTest }) => {
  const isValidBudget = !isNaN(budget) && isFinite(budget);
  return (
    <Card className="card">
      <CardContent className="ratio-content">
        <Typography variant="overline">{title}</Typography>
        <Typography data-test={dataTest} variant="h6">
          {isValidBudget ? `${(budget * 100).toFixed(2)}%` : "-"}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Chart = ({ title, chart, dataTest }) => (
  <Card className="card">
    <CardContent className="chart-content">
      <Typography data-test={dataTest} variant="overline">
        {title}
      </Typography>
      <div>{chart}</div>
    </CardContent>
  </Card>
);

const Dashboard = ({ indicatedCurrency, projectedBudgets, projectedBudget, assignedBudget, disbursedBudget }) => {
  return (
    <div className="dashboard-container">
      <Chart
        title={strings.analytics.projected_budgets_distribution}
        chart={
          <Doughnut
            data={{
              labels: projectedBudgets.map((tb) => tb.organization),
              datasets: [
                {
                  data: projectedBudgets.map((tb) => tb.convertedAmount),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(54, 162, 235, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(153, 102, 255, 0.8)",
                    "rgba(255, 159, 64, 0.8)"
                  ]
                }
              ]
            }}
            options={{
              tooltips: {
                callbacks: {
                  label: (item, data) => {
                    return toAmountString(data.datasets[item.datasetIndex].data[item.index], indicatedCurrency);
                  }
                }
              },
              maintainAspectRatio: false
            }}
            width={250}
            height={250}
          />
        }
      />
      <NumberChart
        title={strings.common.projected_budget}
        budget={projectedBudget}
        dataTest="number-chart-projected-budget"
        currency={indicatedCurrency}
      />
      <NumberChart
        title={strings.common.assigned_budget}
        budget={assignedBudget}
        dataTest="number-chart-assigned-budget"
        currency={indicatedCurrency}
      />
      <NumberChart
        title={strings.common.disbursed_budget}
        budget={disbursedBudget}
        dataTest="number-chart-disbursed-budget"
        currency={indicatedCurrency}
      />
      <RatioChart
        title={strings.analytics.assigned_budget_ratio}
        dataTest="ratio-chart-assigned-budget"
        budget={assignedBudget / projectedBudget}
      />
      <RatioChart
        title={strings.analytics.disbursed_budget_ratio}
        dataTest="ratio-chart-disbursed-budget"
        budget={disbursedBudget / assignedBudget}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    subProjectCurrency: state.getIn(["analytics", "subproject", "currency"]),
    indicatedCurrency: state.getIn(["analytics", "currency"]),
    assignedBudget: state.getIn(["analytics", "subproject", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "subproject", "disbursedBudget"]),
    exchangeRates: state.getIn(["analytics", "exchangeRates"]),
    canShowAnalytics: state.getIn(["analytics", "canShowAnalytics"]),
    isFetchingKPIs: state.getIn(["analytics", "isFetchingKPIs"])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getSubProjectKPIs: (projectId, subprojectId) => dispatch(getSubProjectKPIs(projectId, subprojectId)),
    resetKPIs: () => dispatch(resetKPIs())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubprojectAnalytics));
