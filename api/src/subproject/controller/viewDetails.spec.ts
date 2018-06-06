import { expect } from "chai";
import { AuthenticatedRequest } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
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
        } else {
          throw Error(`unexpected key: ${key}`);
        }
      },
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        let events;
        if (key === "self") {
          events = [
            {
              keys: ["self"],
              data: {
                json: {
                  key: projectId,
                  intent: "global.createProject",
                  createdBy: "alice",
                  createdAt: "2018-05-08T10:27:00.385Z",
                  dataVersion: 1,
                  data: {
                    project: {
                      id: projectId,
                      creationUnixTs: new Date("2018-05-08T10:27:00.385Z").getTime().toString(),
                      status: "open",
                      displayName: "The Sample Project",
                      description: "This project has no description.",
                      amount: "923",
                      currency: "EUR",
                    },
                    permissions: {
                      "project.viewSummary": ["alice"],
                    },
                  },
                },
              },
            },
          ];
        } else if (key === `${subprojectId}_workflows`) {
          events = [
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
        } else if (key === "the-sample-subproject") {
          events = [
            {
              keys: ["subprojects", subprojectId],
              data: {
                json: {
                  key: subprojectId,
                  intent: "project.createSubproject",
                  createdBy: "bob",
                  createdAt: "2018-05-08T11:27:00.385Z",
                  dataVersion: 1,
                  data: {
                    subproject: {
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
                  },
                },
              },
            },
          ];
        } else if (key === `${subprojectId}_workflowitem_ordering`) {
          throw { kind: "NotFound" };
        } else {
          expect(true, `perhaps missing impl for key=${key}`).to.eql(false);
        }
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

    expect(subproject.data.id).to.eql(subprojectId);

    expect(workflowitems.length).to.eql(1);
    expect(workflowitems[0].data.id).to.eql(workflowitemId);
    expect(workflowitems[0].permissions).to.eql(undefined);
    expect(workflowitems[0].allowedIntents).to.eql(["workflowitem.view"]);

    expect(parentProject.id, "Is the user allowed to view the parent project?").to.eql(projectId);
  });
});
