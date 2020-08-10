import { AxiosInstance } from "axios";
import { ServerResponse } from "http";
import {
  Project,
  Subproject,
  Workflowitem,
  getProjects,
  getSubprojects,
  getWorkflowitems,
} from "./api";
import * as jwtDecode from "jwt-decode";

var Excel = require("exceljs");

const smallWidth = 20;
const mediumWidth = 40;
const largeWidth = 60;

export async function writeXLSX(
  axios: AxiosInstance,
  token: string,
  res: ServerResponse,
  base: string,
): Promise<void> {
  try {
    const options = {
      stream: res,
      useStyles: true,
      useSharedStrings: true,
    };
    const { userId } = jwtDecode(token);
    const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    workbook.creator = userId ? userId : "Unknown TruBudget User";
    workbook.created = new Date();

    // Prepare sheets
    const projectSheet = workbook.addWorksheet("Projects");
    const subprojectSheet = workbook.addWorksheet("Subprojects");
    const workflowitemSheet = workbook.addWorksheet("Workflowitems");
    const projectProjectedBudgetsSheet = workbook.addWorksheet("Project Projected Budgets");
    const subprojectProjectedBudgetsSheet = workbook.addWorksheet("Subproject Projected Budgets");
    const documentSheet = workbook.addWorksheet("Documents");

    projectSheet.columns = [
      { header: "Project ID", key: "id", width: mediumWidth },
      { header: "Project Name", key: "displayName", width: mediumWidth },
      { header: "Created", key: "creationUnixTs", width: mediumWidth },
      { header: "Status", key: "status", width: smallWidth },
      { header: "Description", key: "description", width: mediumWidth },
      { header: "Assignee", key: "assignee", width: smallWidth },
      { header: "Additional Data", key: "additionalData", width: smallWidth },
    ];

    subprojectSheet.columns = [
      { header: "Project ID", key: "parentId", width: mediumWidth },
      { header: "Project Name", key: "parentDisplayName", width: mediumWidth },
      { header: "Subproject ID", key: "id", width: mediumWidth },
      { header: "Subproject Name", key: "displayName", width: mediumWidth },
      { header: "Created", key: "creationUnixTs", width: mediumWidth },
      { header: "Status", key: "status", width: smallWidth },
      { header: "Description", key: "description", width: mediumWidth },
      { header: "Assignee", key: "assignee", width: smallWidth },
      { header: "Currency", key: "currency", width: smallWidth },
      { header: "Additional Data", key: "additionalData", width: smallWidth },
    ];

    workflowitemSheet.columns = [
      { header: "Project ID", key: "parentProjectId", width: mediumWidth },
      { header: "Project Name", key: "parentProjectDisplayName", width: mediumWidth },
      { header: "Subproject ID", key: "parentSubprojectId", width: mediumWidth },
      { header: "Subproject Name", key: "parentSubprojectDisplayName", width: mediumWidth },
      { header: "Subproject Currency", key: "parentSubprojectCurrency", width: smallWidth },
      { header: "Workflowitem ID", key: "id", width: mediumWidth },
      { header: "Workflowitem Name", key: "displayName", width: mediumWidth },
      { header: "Workflowitem Type", key: "workflowitemType", width: smallWidth },
      { header: "Created", key: "creationUnixTs", width: mediumWidth },
      { header: "Status", key: "status", width: smallWidth },
      { header: "Description", key: "description", width: mediumWidth },
      { header: "Assignee", key: "assignee", width: smallWidth },
      { header: "Billing Date", key: "billingDate", width: mediumWidth },
      { header: "Due Date", key: "dueDate", width: mediumWidth },
      { header: "Amount Type", key: "amountType", width: smallWidth },
      { header: "Amount", key: "amount", width: smallWidth },
      { header: "Currency", key: "currency", width: smallWidth },
      { header: "Exchange Rate", key: "exchangeRate", width: smallWidth },
    ];

    documentSheet.columns = [
      { header: "Project ID", key: "projectId", width: mediumWidth },
      { header: "Project Name", key: "projectDisplayName", width: mediumWidth },
      { header: "Subproject ID", key: "subprojectId", width: mediumWidth },
      { header: "Subproject Name", key: "subprojectDisplayName", width: mediumWidth },
      { header: "Workflowitem ID", key: "workflowitemId", width: mediumWidth },
      { header: "Workflowitem Name", key: "workflowitemDisplayName", width: mediumWidth },
      { header: "Name", key: "name", width: mediumWidth },
      { header: "Hash", key: "hash", width: largeWidth },
    ];

    projectProjectedBudgetsSheet.columns = [
      { header: "Project ID", key: "parentId", width: mediumWidth },
      { header: "Project Name", key: "parentDisplayName", width: mediumWidth },
      { header: "Organization", key: "organization", width: mediumWidth },
      { header: "Currency", key: "currencyCode", width: smallWidth },
      { header: "Amount", key: "value", width: mediumWidth },
    ];

    subprojectProjectedBudgetsSheet.columns = [
      { header: "Project ID", key: "parentProjectId", width: mediumWidth },
      { header: "Project Name", key: "parentProjectDisplayName", width: mediumWidth },
      { header: "Subproject ID", key: "parentSubprojectId", width: mediumWidth },
      { header: "Subproject Name", key: "parentSubprojectDisplayName", width: mediumWidth },
      { header: "Organization", key: "organization", width: mediumWidth },
      { header: "Currency", key: "currencyCode", width: smallWidth },
      { header: "Amount", key: "value", width: mediumWidth },
    ];

    const projects: Project[] = await getProjects(axios, token, base);

    for (const project of projects) {
      projectSheet
        .addRow({
          ...project,
          creationUnixTs: new Date(parseInt(project.creationUnixTs, 10) * 1000).toISOString(),
        })
        .commit();

      project.projectedBudgets.map((projectedBudget) => {
        projectProjectedBudgetsSheet
          .addRow({
            ...projectedBudget,
            value: projectedBudget.value ? parseFloat(projectedBudget.value) : undefined,
            parentId: project.id,
            parentDisplayName: project.displayName,
          })
          .commit();
      });

      const subprojects: Subproject[] = await getSubprojects(axios, project.id, token, base);
      for (const subproject of subprojects) {
        subprojectSheet
          .addRow({
            ...subproject,
            parentId: project.id,
            parentDisplayName: project.displayName,
            creationUnixTs: new Date(parseInt(subproject.creationUnixTs, 10) * 1000).toISOString(),
          })
          .commit();

        subproject.projectedBudgets.map(async (projectedBudget) => {
          subprojectProjectedBudgetsSheet
            .addRow({
              ...projectedBudget,
              value: projectedBudget.value ? parseFloat(projectedBudget.value) : undefined,
              parentProjectId: project.id,
              parentProjectDisplayName: project.displayName,
              parentSubprojectId: subproject.id,
              parentSubprojectDisplayName: subproject.displayName,
            })
            .commit();
        });

        const workflowitems: Workflowitem[] = await getWorkflowitems(
          axios,
          project.id,
          subproject.id,
          token,
          base,
        );
        for (const workflowitem of workflowitems) {
          workflowitemSheet
            .addRow({
              ...workflowitem,
              parentProjectId: project.id,
              parentProjectDisplayName: project.displayName,
              parentSubprojectId: subproject.id,
              parentSubprojectDisplayName: subproject.displayName,
              parentSubprojectCurrency: subproject.currency,
              amount: workflowitem.amount ? parseFloat(workflowitem.amount) : undefined,
              exchangeRate: workflowitem.exchangeRate
                ? parseFloat(workflowitem.exchangeRate)
                : undefined,
              creationUnixTs: new Date(parseInt(workflowitem.creationUnixTs) * 1000).toISOString(),
            })
            .commit();
          workflowitem.documents.map((doc) => {
            documentSheet
              .addRow({
                projectId: project.id,
                projectDisplayName: project.displayName,
                subprojectId: subproject.id,
                subprojectDisplayName: subproject.displayName,
                workflowitemId: workflowitem.id,
                workflowitemDisplayName: workflowitem.displayName,
                name: doc.id,
                hash: doc.hash,
              })
              .commit();
          });
        }
      }
    }
    await workbook.commit();
  } catch (error) {
    throw new Error(`Error making request to TruBudget: ${error.message} -> ${error.config.url}`);
  }
}
