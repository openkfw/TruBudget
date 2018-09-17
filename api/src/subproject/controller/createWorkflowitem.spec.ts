import { expect } from "chai";
import { AuthenticatedRequest } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import { createWorkflowitem } from "./createWorkflowitem";

describe("subproject.createWorkflowitem", () => {
  it("works", async () => {
    const projectId = "my-project";
    const subprojectId = "my-subproject";
    const workflowitemId = "my-workflowitem";

    const multichain: any = {
      getRpcClient: () => ({
        invoke: (method, streamName, keys, payload) => {
          expect(method).to.eql("publish");
          expect(streamName).to.eql(projectId);
          expect(keys).to.eql([`${subprojectId}_workflows`, workflowitemId]);

          const event = payload.json;
          expect(event.intent).to.eql("subproject.createWorkflowitem");
        },
      }),
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        let events;
        if (key === subprojectId) {
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
                      displayName: `Subproject ${subprojectId}`,
                      status: "open",
                      amount: "1",
                      currency: "EUR",
                      description: "",
                    },
                    permissions: {
                      "subproject.createWorkflowitem": ["alice"],
                    },
                  },
                },
              },
            },
          ];
        }

        return events;
      },
    };

    const req = {
      method: "POST",
      body: {
        apiVersion: "1.0",
        data: {
          projectId,
          subprojectId,
          workflowitemId,

          amount: "123",
          amountType: "allocated",
          currency: "EUR",
          description: "A nice item.",
          displayName: "My Workflow-Item",
          assignee: "alice", // TODO: alice is not recognized by the multichain-mock, need to add the event
          documents: [],
          status: "open",
        },
      },
      token: {
        userId: "alice",
      },
    };

    const [status, response] = await createWorkflowitem(
      multichain as MultichainClient,
      req as AuthenticatedRequest,
    );
    expect(status).to.eql(201);
    expect(response).to.eql({
      apiVersion: "1.0",
      data: { created: true },
    });
  });

  it("should not create a Workflowitem with assignee who does not exist", async () => {
    const projectId = "my-project";
    const subprojectId = "my-subproject";
    const workflowitemId = "my-workflowitem";

    const multichain: any = {
      getRpcClient: () => ({
        invoke: (method, streamName, keys, payload) => {
          expect(method).to.eql("publish");
          expect(streamName).to.eql(projectId);
          expect(keys).to.eql([`${subprojectId}_workflows`, workflowitemId]);

          const event = payload.json;
          expect(event.intent).to.eql("subproject.createWorkflowitem");
        },
      }),
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        let events;
        if (key === subprojectId) {
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
                      displayName: `Subproject ${subprojectId}`,
                      status: "open",
                      amount: "1",
                      currency: "EUR",
                      description: "",
                    },
                    permissions: {
                      "subproject.createWorkflowitem": ["alice"],
                    },
                  },
                },
              },
            },
          ];
        }

        return events;
      },
    };

    const req = {
      method: "POST",
      body: {
        apiVersion: "1.0",
        data: {
          projectId,
          subprojectId,
          workflowitemId,

          amount: "123",
          amountType: "allocated",
          currency: "EUR",
          description: "A nice item.",
          displayName: "My Workflow-Item",
          assignee: "notExistingUser",
          documents: [],
          status: "open",
        },
      },
      token: {
        userId: "alice",
      },
    };

    const [status, response] = await createWorkflowitem(
      multichain as MultichainClient,
      req as AuthenticatedRequest,
    );
    expect(status).to.eql(400);
    expect(response).to.eql({
      apiVersion: "1.0",
      error: {
        code: 400,
        message: "Missing keys: assignee",
      },
    });
  });
});
