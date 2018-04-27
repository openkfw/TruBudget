import { expect } from "chai";
import { AuthenticatedRequest } from "../httpd/lib";
import { MultichainClient } from "../multichain/Client.h";
import { getSubprojectDetails } from "./viewDetails";

describe("subproject.viewDetails", () => {
  it("works", async () => {
    const multichain: any = {
      getValue: (streamName, key, nValues) => {
        expect(streamName).to.eql("the-sample-project");
        if (key === "self") {
          return {
            key: ["self"],
            resource: {
              data: {
                id: "the-sample-project",
                displayName: "The Sample Project"
              },
              permissions: {},
              log: {}
            }
          };
        } else if (key === "the-sample-subproject") {
          return {
            key: ["subprojects", "the-sample-subproject"],
            resource: {
              data: {
                id: "the-sample-subproject",
                displayName: "The Sample Subproject",
                status: "open",
                amount: "1",
                currency: "EUR",
                description: ""
              },
              permissions: {
                "subproject.viewSummary": ["alice"],
                "subproject.viewDetails": ["alice"],
                "subproject.close": ["alice"]
              },
              log: []
            }
          };
        } else {
          throw Error(`unexpected key: ${key}`);
        }
      },
      getLatestValues: (streamName, key, nValues) => {
        expect(streamName).to.eql("the-sample-project");
        if (key === "the-sample-subproject_workflows") {
          return [
            {
              key: ["the-sample-subproject_workflows", "wf-one"],
              resource: {
                data: {
                  id: "wf-one",
                  amount: "11",
                  currency: "EUR",
                  comment: "",
                  status: "open"
                },
                permissions: {
                  "workflowitem.view": ["alice"]
                },
                log: []
              }
            }
          ];
        } else {
          throw Error(`unexpected key: ${key}`);
        }
      }
    };

    const req = {
      query: {
        projectId: "the-sample-project",
        subprojectId: "the-sample-subproject"
      },
      token: {
        userId: "alice"
      }
    };

    const [status, response] = await getSubprojectDetails(
      multichain as MultichainClient,
      req as AuthenticatedRequest
    );
    expect(status).to.eql(200);
    expect(response).to.eql({
      apiVersion: "1.0",
      data: {
        subproject: {
          id: "the-sample-subproject",
          displayName: "The Sample Subproject",
          status: "open",
          amount: "1",
          currency: "EUR",
          description: "",
          allowedIntents: ["subproject.viewSummary", "subproject.viewDetails", "subproject.close"]
        },
        workflowitems: [
          {
            id: "wf-one",
            amount: "11",
            currency: "EUR",
            comment: "",
            status: "open",
            allowedIntents: ["workflowitem.view"]
          }
        ],
        parentProject: {
          id: "the-sample-project",
          displayName: "The Sample Project"
        }
      }
    });
  });
});
