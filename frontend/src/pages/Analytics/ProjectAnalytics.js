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

import { getProjectKPIs, resetKPIs } from "./actions";

import "./index.scss";

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

class ProjectAnalytics extends React.Component {
  componentDidMount() {
    this.props.getProjectKPIs(this.props.projectId);
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

  convertTotalBudget() {
    return this.props.totalBudget.map((pb) => {
      return {
        ...pb,
        convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
      };
    });
  }
  convertProjectedBudget() {
    return this.props.projectedBudget.map((pb) =>
      pb.map((pb) => {
        return {
          ...pb,
          convertedAmount: this.convertToSelectedCurrency(pb.value, pb.currencyCode)
        };
      })
    );
  }

  render() {
    const { indicatedCurrency } = this.props;
    const convertedTotalBudget = this.convertTotalBudget();
    const totalBudgets = this.convertTotalBudget();
    const totalBudget = totalBudgets.reduce((acc, next) => {
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

    return !this.props.isFetchingKPIs ? (
      <>
        <div className="analytics-container">
          <div className="top-container">
            <div className="table">
              <Table data-test="projected-budget-table">
                <TableHead>
                  <TableRow>
                    <TableCell>{strings.common.organization}</TableCell>
                    <TableCell align="right">{strings.amount}</TableCell>
                    <TableCell align="right">{strings.common.currency}</TableCell>
                    <TableCell align="right">{strings.workflow.exchange_rate}</TableCell>
                    <TableCell align="right">{strings.analytics.converted_amount}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {convertedTotalBudget.map((budget) => (
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
                      {toAmountString(totalBudget, indicatedCurrency)}
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
              totalBudgets={totalBudgets}
              totalBudget={totalBudget}
              disbursedBudget={disbursedBudget}
              assignedBudget={assignedBudget}
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

const onlyPositive = (number) => (number < 0 ? 0 : number);

const NumberChart = ({ title, budget, currency, dataTest }) => (
  <Card className="card">
    <CardContent className="number-content">
      <Typography variant="overline">{title}</Typography>
      <Typography variant="h6" data-test={dataTest}>
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

const Chart = ({ title, chart }) => (
  <Card className="card">
    <CardContent className="chart-content">
      <Typography variant="overline">{title}</Typography>
      <div>{chart}</div>
    </CardContent>
  </Card>
);

const Dashboard = ({
  indicatedCurrency,
  totalBudgets,
  totalBudget,
  projectedBudget,
  assignedBudget,
  disbursedBudget
}) => {
  return (
    <div className="dashboard-container">
      <NumberChart
        title={strings.common.total_budget}
        budget={totalBudget}
        dataTest="number-chart-total-budget"
        currency={indicatedCurrency}
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
      <Chart
        title={strings.analytics.total_budget_distribution}
        chart={
          <Doughnut
            data={{
              labels: totalBudgets.map((tb) => tb.organization),
              datasets: [
                {
                  data: totalBudgets.map((tb) => tb.convertedAmount),
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
      <RatioChart
        title={strings.analytics.projected_budget_ratio}
        dataTest="ratio-chart-projected-budget"
        budget={projectedBudget / totalBudget}
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
      <Chart
        title={strings.analytics.available_unspent_budget}
        chart={
          <Doughnut
            data={{
              labels: [strings.common.not_projected, strings.common.not_assigned, strings.common.not_disbursed],
              datasets: [
                {
                  data: [
                    onlyPositive(totalBudget - projectedBudget),
                    onlyPositive(projectedBudget - assignedBudget),
                    onlyPositive(assignedBudget - disbursedBudget)
                  ],
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
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    projectedBudget: state.getIn(["analytics", "project", "projectedBudget"]),
    assignedBudget: state.getIn(["analytics", "project", "assignedBudget"]),
    disbursedBudget: state.getIn(["analytics", "project", "disbursedBudget"]),
    indicatedCurrency: state.getIn(["analytics", "currency"]),
    exchangeRates: state.getIn(["analytics", "exchangeRates"]),
    canShowAnalytics: state.getIn(["analytics", "canShowAnalytics"]),
    isFetchingKPIs: state.getIn(["analytics", "isFetchingKPIs"])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getProjectKPIs: (projectId) => dispatch(getProjectKPIs(projectId)),
    resetKPIs: () => dispatch(resetKPIs())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(ProjectAnalytics));
