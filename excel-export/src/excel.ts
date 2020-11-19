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
import strings from "./localizeStrings";

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
    const projectSheet = workbook.addWorksheet(strings.project.title);
    const subprojectSheet = workbook.addWorksheet(strings.subproject.title);
    const workflowitemSheet = workbook.addWorksheet(strings.workflowitem.title);
    const projectProjectedBudgetsSheet = workbook.addWorksheet(
      strings.project_projected_budget.title,
    );
    const subprojectProjectedBudgetsSheet = workbook.addWorksheet(
      strings.subproject_projected_budget.title,
    );
    const documentSheet = workbook.addWorksheet(strings.document.title);

    projectSheet.columns = [
      { header: strings.project.id, key: "id", width: mediumWidth },
      { header: strings.project.name, key: "displayName", width: mediumWidth },
      { header: strings.common.created, key: "creationUnixTs", width: mediumWidth },
      { header: strings.common.status, key: "status", width: smallWidth },
      { header: strings.common.description, key: "description", width: mediumWidth },
      { header: strings.common.assignee, key: "assignee", width: smallWidth },
      { header: strings.common.additional_data, key: "additionalData", width: smallWidth },
    ];

    subprojectSheet.columns = [
      { header: strings.project.id, key: "parentId", width: mediumWidth },
      { header: strings.project.name, key: "parentDisplayName", width: mediumWidth },
      { header: strings.subproject.id, key: "id", width: mediumWidth },
      { header: strings.subproject.name, key: "displayName", width: mediumWidth },
      { header: strings.common.created, key: "creationUnixTs", width: mediumWidth },
      { header: strings.common.status, key: "status", width: smallWidth },
      { header: strings.common.description, key: "description", width: mediumWidth },
      { header: strings.subproject.workflowitem_type, key: "workflowitemType", width: mediumWidth },
      { header: strings.subproject.validator, key: "validator", width: mediumWidth },
      { header: strings.common.assignee, key: "assignee", width: smallWidth },
      { header: strings.common.currency, key: "currency", width: smallWidth },
      { header: strings.common.additional_data, key: "additionalData", width: smallWidth },
    ];

    workflowitemSheet.columns = [
      { header: strings.project.id, key: "parentProjectId", width: mediumWidth },
      { header: strings.project.name, key: "parentProjectDisplayName", width: mediumWidth },
      { header: strings.subproject.id, key: "parentSubprojectId", width: mediumWidth },
      { header: strings.subproject.name, key: "parentSubprojectDisplayName", width: mediumWidth },
      {
        header: strings.workflowitem.subproject_currency,
        key: "parentSubprojectCurrency",
        width: smallWidth,
      },
      { header: strings.workflowitem.id, key: "id", width: mediumWidth },
      { header: strings.workflowitem.name, key: "displayName", width: mediumWidth },
      { header: strings.workflowitem.type, key: "workflowitemType", width: smallWidth },
      { header: strings.common.created, key: "creationUnixTs", width: mediumWidth },
      { header: strings.common.status, key: "status", width: smallWidth },
      { header: strings.common.description, key: "description", width: mediumWidth },
      { header: strings.common.assignee, key: "assignee", width: smallWidth },
      { header: strings.common.billing_date, key: "billingDate", width: mediumWidth },
      { header: strings.common.due_date, key: "dueDate", width: mediumWidth },
      { header: strings.common.amount_type, key: "amountType", width: smallWidth },
      { header: strings.common.amount, key: "amount", width: smallWidth },
      { header: strings.common.currency, key: "currency", width: smallWidth },
      { header: strings.common.exchange_rate, key: "exchangeRate", width: smallWidth },
    ];

    documentSheet.columns = [
      { header: strings.project.id, key: "projectId", width: mediumWidth },
      { header: strings.project.name, key: "projectDisplayName", width: mediumWidth },
      { header: strings.subproject.id, key: "subprojectId", width: mediumWidth },
      { header: strings.subproject.name, key: "subprojectDisplayName", width: mediumWidth },
      { header: strings.workflowitem.id, key: "workflowitemId", width: mediumWidth },
      { header: strings.workflowitem.name, key: "workflowitemDisplayName", width: mediumWidth },
      { header: strings.document.name, key: "name", width: mediumWidth },
      { header: strings.document.hash, key: "hash", width: largeWidth },
    ];

    projectProjectedBudgetsSheet.columns = [
      { header: strings.project.id, key: "parentId", width: mediumWidth },
      { header: strings.project.name, key: "parentDisplayName", width: mediumWidth },
      { header: strings.common.organisation, key: "organization", width: mediumWidth },
      { header: strings.common.currency, key: "currencyCode", width: smallWidth },
      { header: strings.common.amount, key: "value", width: mediumWidth },
    ];

    subprojectProjectedBudgetsSheet.columns = [
      { header: strings.project.id, key: "parentProjectId", width: mediumWidth },
      { header: strings.project.name, key: "parentProjectDisplayName", width: mediumWidth },
      { header: strings.subproject.id, key: "parentSubprojectId", width: mediumWidth },
      { header: strings.subproject.name, key: "parentSubprojectDisplayName", width: mediumWidth },
      { header: strings.common.organisation, key: "organization", width: mediumWidth },
      { header: strings.common.currency, key: "currencyCode", width: smallWidth },
      { header: strings.common.amount, key: "value", width: mediumWidth },
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
