import { expect } from "chai";
import { AuthenticatedRequest } from "../httpd/lib";
import { MultichainClient } from "../multichain/Client.h";
import { getWorkflowitemList } from "./list";

describe("workflowitem.list", () => {
  it("works", async () => {
    const projectId = "the-sample-project";
    const subprojectId = "the-subproject";

    const multichain: any = {
      getLatestValues: (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        expect(key).to.eql(`${subprojectId}_workflows`);
        const workflowitems = [
          {
            key: [`${subprojectId}_workflows`, "one"],
            resource: {
              data: {
                id: "one",
                displayName: "item one",
                amount: "1",
                currency: "EUR",
                amountType: "N/A",
                description: "",
                status: "open",
                documents: [],
              },
              permissions: {
                "workflowitem.view": ["alice"],
                "workflowitem.assign": ["alice"],
                "workflowitem.archive": [],
              },
              log: [],
            },
          },
          {
            key: [`${subprojectId}_workflows`, "two"],
            resource: {
              data: {
                id: "two",
                displayName: "item two",
                amount: "2",
                currency: "USD",
                amountType: "disbursed",
                description: "some comment",
                status: "open",
                documents: [],
                previousWorkflowitemId: "one",
              },
              permissions: {
                "workflowitem.view": ["alice"],
                "workflowitem.assign": [],
                "workflowitem.archive": [],
              },
              log: [],
            },
          },
        ];
        return workflowitems;
      },
    };

    const req = {
      query: {
        projectId,
        subprojectId,
      },
      token: {
        userId: "alice",
      },
    };

    const [status, response] = await getWorkflowitemList(
      multichain as MultichainClient,
      req as AuthenticatedRequest,
    );

    expect(status).to.eql(200);
    expect(response).to.eql({
      apiVersion: "1.0",
      data: {
        workflowitems: [
          {
            id: "one",
            displayName: "item one",
            amount: "1",
            currency: "EUR",
            amountType: "N/A",
            description: "",
            status: "open",
            documents: [],
            allowedIntents: ["workflowitem.view", "workflowitem.assign"],
          },
          {
            id: "two",
            displayName: "item two",
            amount: "2",
            currency: "USD",
            amountType: "disbursed",
            description: "some comment",
            status: "open",
            documents: [],
            previousWorkflowitemId: "one",
            allowedIntents: ["workflowitem.view"],
          },
        ],
      },
    });
  });
});
