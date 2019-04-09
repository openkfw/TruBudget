import * as api from "./api";

var Excel = require("exceljs");

function formatProjectedBudgets(budgets): string {
  return budgets.map(budget => `${budget.organization}: ${budget.value} ${budget.currencyCode}`);
}

export async function writeXLS(axios): Promise<void> {
  // Prepare workbook
  const options = {
    filename: "./streamed-workbook.xlsx",
    useStyles: true,
    useSharedStrings: true,
  };
  const workbook = new Excel.stream.xlsx.WorkbookWriter(options);
  // var workbook = new Excel.Workbook();

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

  const projectList = await api.getProjects(axios);
  const projects = projectList.map(project => {
    const dataObject = project.data;
    return dataObject;
  });

  // Start writing
  await Promise.all(
    // Start on project level
    projects.map(async project => {
      projectSheet.addRow(project).commit();
      await project.projectedBudgets.map((projectedBudget, index) => {
        projectedBudget.id = `projectProjected${index}`;
        projectedBudget.parentId = project.id;
        projectedBudget.parentDisplayName = project.displayName;
        projectProjectedBudgetsSheet.addRow(projectedBudget).commit();
      });

      // Get all subprojects for the current project
      const subprojectList = await api.getSubprojects(axios, project.id);
      const subprojects = subprojectList.map(subproject => {
        const dataObject = subproject.data;
        dataObject.parentId = project.id;
        dataObject.parentDisplayName = project.displayName;
        return dataObject;
      });

      await Promise.all(
        subprojects.map(async subproject => {
          subprojectSheet.addRow(subproject).commit();

          // Get all workflowitems for the current subproject
          const workflowitemList = await api.getWorkflowitems(axios, project.id, subproject.id);
          const workflowitems = workflowitemList.map(async workflowitem => {
            const dataObject = workflowitem.data;
            dataObject.parentProjectId = project.id;
            dataObject.parentProjectDisplayName = project.displayName;
            dataObject.parentSubprojectId = subproject.id;
            dataObject.parentSubprojectDisplayName = subproject.displayName;
            dataObject.parentSubprojectCurrency = subproject.currency;
            return dataObject;
          });

          await Promise.all(
            workflowitems.map(async workflowitem => {
              workflowitemSheet.addRow(await Promise.resolve(workflowitem)).commit();
            }),
          );

          subproject.projectedBudgets.map(async (projectedBudget, subindex) => {
            projectedBudget.id = `subprojectProjected${subindex}`;
            projectedBudget.parentProjectId = project.id;
            projectedBudget.parentProjectDisplayName = project.displayName;
            projectedBudget.parentSubprojectId = subproject.id;
            projectedBudget.parentSubprojectDisplayName = subproject.displayName;
            subprojectProjectedBudgetsSheet.addRow(projectedBudget).commit();
          });
        }),
      );
    }),
  );
  await projectSheet.commit();
  await projectProjectedBudgetsSheet.commit();
  await subprojectSheet.commit();
  await subprojectProjectedBudgetsSheet.commit();
  await workflowitemSheet.commit();

  await workbook.commit();
  // workbook.xlsx.writeFile("testfile.xlsx");
}
