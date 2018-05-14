import { expect } from "chai";
import { AuthenticatedRequest } from "../httpd/lib";
import { MultichainClient } from "../multichain/Client.h";
import { getSubprojectDetails } from "./viewDetails";

describe("subproject.viewDetails", () => {
  it("works", async () => {
    const projectId = "the-sample-project";
    const subprojectId = "the-sample-subproject";
    const workflowitemId = "the-sample-workflow";

    const multichain: any = {
      getValue: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        if (key === "self") {
          return {
            key: ["self"],
            resource: {
              data: {
                id: projectId,
                displayName: "The Sample Project",
              },
              permissions: {},
              log: {},
            },
          };
        } else if (key === "the-sample-subproject") {
          return {
            key: ["subprojects", subprojectId],
            resource: {
              data: {
                id: subprojectId,
                displayName: "The Sample Subproject",
                status: "open",
                amount: "1",
                currency: "EUR",
                description: "",
              },
              permissions: {
                "subproject.viewSummary": ["alice"],
                "subproject.viewDetails": ["alice"],
                "subproject.close": ["alice"],
              },
              log: [],
            },
          };
        } else if (key === "workflowitem_ordering") {
          throw { kind: "NotFound" };
        } else {
          throw Error(`unexpected key: ${key}`);
        }
      },
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        expect(key).to.eql(`${subprojectId}_workflows`);
        const events = [
          {
            keys: [`${subprojectId}_workflows`, "the-sample-workflow"],
            data: {
              json: {
                key: "the-sample-workflow",
                intent: "subproject.createWorkflowitem",
                createdBy: "alice",
                createdAt: "2018-05-08T11:27:00.385Z",
                dataVersion: 1,
                data: {
                  workflowitem: {
                    id: "the-sample-workflow",
                    displayName: "the-sample-workflow",
                    amount: "11",
                    currency: "EUR",
                    amountType: "N/A",
                    description: "",
                    status: "open",
                    documents: [],
                  },
                  permissions: {
                    "workflowitem.view": ["alice"],
                  },
                },
              },
            },
          },
        ];
        return events;
      },
    };

    const req = {
      query: {
        projectId: "the-sample-project",
        subprojectId: "the-sample-subproject",
      },
      token: {
        userId: "alice",
        organization: "Umbrella Corp.",
      },
    };

    const [status, response] = await getSubprojectDetails(
      multichain as MultichainClient,
      req as AuthenticatedRequest,
    );
    expect(status).to.eql(200);
    const { subproject, workflowitems, parentProject } = (response as any).data;

    expect(subproject.id).to.eql(subprojectId);

    expect(workflowitems.length).to.eql(1);
    expect(workflowitems[0].data.id).to.eql(workflowitemId);
    expect(workflowitems[0].log[0].key).to.eql(workflowitemId);
    expect(workflowitems[0].permissions).to.eql(undefined);
    expect(workflowitems[0].allowedIntents).to.eql(["workflowitem.view"]);

    expect(parentProject.id).to.eql(projectId);
  });
});
