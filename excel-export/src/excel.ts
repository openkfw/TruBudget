import * as api from "./api";
import { IncomingMessage, ServerResponse } from "http";
import { AxiosInstance } from "axios";

var Excel = require("exceljs");

export async function writeXLS(
  axios: AxiosInstance,
  token: string,
  res: ServerResponse,
): Promise<void> {
  try {
    const options = {
      stream: res,
      useStyles: true,
      useSharedStrings: true,
    };
    const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    workbook.creator = "TruBudget";
    workbook.created = new Date();

    // Prepare sheets
    const projectSheet = workbook.addWorksheet("Projects");
    const subprojectSheet = workbook.addWorksheet("Subprojects");
    const workflowitemSheet = workbook.addWorksheet("Workflowitems");
    const projectProjectedBudgetsSheet = workbook.addWorksheet("Project Projected Budgets");
    const subprojectProjectedBudgetsSheet = workbook.addWorksheet("Subproject Projected Budgets");

    projectSheet.columns = [
      { header: "ID", key: "id" },
      { header: "Created", key: "creationUnixTs" },
      { header: "Status", key: "status" },
      { header: "Display Name", key: "displayName" },
      { header: "Description", key: "description" },
      { header: "assignee", key: "assignee" },
      { header: "Projected Budgets", key: "projectedBudgets" },
      { header: "Additional Data", key: "additionalData" },
    ];

    subprojectSheet.columns = [
      { header: "ID", key: "id" },
      { header: "Parent Project ID", key: "parentId" },
      { header: "Parent Project Name", key: "parentDisplayName" },
      { header: "Created", key: "creationUnixTs" },
      { header: "Status", key: "status" },
      { header: "Display Name", key: "displayName" },
      { header: "Description", key: "description" },
      { header: "Assignee", key: "assignee" },
      { header: "Currency", key: "currency" },
      { header: "Projected Budgets", key: "projectedBudgets" },
      { header: "Additional Data", key: "additionalData" },
    ];

    workflowitemSheet.columns = [
      { header: "ID", key: "id" },
      { header: "Parent Project ID", key: "parentProjectId" },
      { header: "Parent Project Name", key: "parentProjectDisplayName" },
      { header: "Parent Subproject ID", key: "parentSubprojectId" },
      { header: "Parent Subproject Name", key: "parentSubprojectDisplayName" },
      { header: "Parent Subproject Currency", key: "parentSubprojectCurrency" },
      { header: "Created", key: "creationUnixTs" },
      { header: "Status", key: "status" },
      { header: "Workflowitem", key: "displayName" },
      { header: "Description", key: "description" },
      { header: "Assignee", key: "assignee" },
      { header: "Billing Date", key: "billingDate" },
      { header: "Documents", key: "documents" },
      { header: "Amount Type", key: "amountType" },
      { header: "Amount", key: "amount" },
      { header: "Currency", key: "currency" },
      { header: "Exchange Rate", key: "exchangeRate" },
    ];

    projectProjectedBudgetsSheet.columns = [
      { header: "ID", key: "id" },
      { header: "Parent Project ID", key: "parentId" },
      { header: "Parent Project Name", key: "parentDisplayName" },
      { header: "Organization", key: "organization" },
      { header: "Currency", key: "currencyCode" },
      { header: "Amount", key: "value" },
    ];

    subprojectProjectedBudgetsSheet.columns = [
      { header: "ID", key: "id" },
      { header: "Parent Project ID", key: "parentProjectId" },
      { header: "Parent Project Name", key: "parentProjectDisplayName" },
      { header: "Parent Subproject ID", key: "parentSubprojectId" },
      { header: "Parent Subproject Name", key: "parentSubprojectDisplayName" },
      { header: "Organization", key: "organization" },
      { header: "Currency", key: "currencyCode" },
      { header: "Amount", key: "value" },
    ];

    const projects = await api.getProjects(axios);

    for (const project of projects) {
      projectSheet
        .addRow({
          ...project,
          creationUnixTs: new Date(project.creationUnixTs * 1000).toISOString(),
        })
        .commit();

      project.projectedBudgets.map((projectedBudget, index) => {
        projectProjectedBudgetsSheet
          .addRow({
            ...projectedBudget,
            id: index,
            parentId: project.id,
            parentDisplayName: project.displayName,
          })
          .commit();
      });

      const subprojects = await api.getSubprojects(axios, project.id);
      for (const subproject of subprojects) {
        subprojectSheet
          .addRow({
            ...subproject,
            parentId: project.id,
            parentDisplayName: project.displayName,
            creationUnixTs: new Date(subproject.creationUnixTs * 1000).toISOString(),
          })
          .commit();

        subproject.projectedBudgets.map(async (projectedBudget, subindex) => {
          subprojectProjectedBudgetsSheet
            .addRow({
              ...projectedBudget,
              id: subindex,
              parentProjectId: project.id,
              parentProjectDisplayName: project.displayName,
              parentSubprojectId: subproject.id,
              parentSubprojectDisplayName: subproject.displayName,
            })
            .commit();
        });

        const workflowitems = await api.getWorkflowitems(axios, project.id, subproject.id);
        for (const workflowitem of workflowitems) {
          workflowitemSheet
            .addRow({
              ...workflowitem,
              parentProjectId: project.id,
              parentProjectDisplayName: project.displayName,
              parentSubprojectId: subproject.id,
              parentSubprojectDisplayName: subproject.displayName,
              parentSubprojectCurrency: subproject.currency,
              creationUnixTs: new Date(workflowitem.creationUnixTs * 1000).toISOString(),
            })
            .commit();
        }
      }
    }
    await workbook.commit();
  } catch (error) {
    console.error(error);
  }
}
