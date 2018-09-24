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
      getValue: async (streamName, key) => {
        return {
          resource: {
            data: {
              id: "alice",
              displayName: "Alice",
              organization: "ACMECorp",
              address: "1Zh7UWdKKaPMFWLgoKdUkRcGaGSW6TNSii41ee",
              passwordDigest: "$2a$08$yppae7E8SE1VZoMHmhwScud0SldE8n7MNBtVeFpR3gxGSJz6JLHGS",
            },
            log: [
              {
                issuer: "root",
                action: "user_created",
              },
            ],
            permissions: {},
          },
        };
      },
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
          assignee: "alice",
          documents: [],
          status: "open",
        },
      },
      user: {
        userId: "alice",
        groups: [] as string[],
      },
    };

    const [status, response] = await createWorkflowitem(multichain as MultichainClient, req);
    expect(status).to.eql(201);
    expect(response).to.eql({
      apiVersion: "1.0",
      data: { created: true },
    });
  });

  it("should not create a Workflowitem with assignee who does not exist", done => {
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
      getValue: async (streamName, key) => {
        return {
          resource: {},
        };
      },
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
      user: {
        userId: "alice",
        groups: [] as string[],
      },
    };
    createWorkflowitem(multichain as MultichainClient, req)
      .then(() => expect(true).to.be.false)
      .catch(err => {
        expect(err.kind).to.be.a("string", "ParseError");
        done();
      });
  });
});
