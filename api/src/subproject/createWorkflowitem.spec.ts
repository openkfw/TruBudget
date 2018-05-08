import { expect } from "chai";
import { AuthenticatedRequest } from "../httpd/lib";
import { MultichainClient } from "../multichain/Client.h";
import { createWorkflowitem } from "./createWorkflowitem";

describe("subproject.createWorkflowitem", () => {
  it("works", async () => {
    const projectId = "my-project";
    const subprojectId = "my-subproject";
    const workflowitemId = "my-workflowitem";

    const multichain: any = {
      getValue: async (streamName, keys) => {
        expect(streamName).to.eql(projectId);
        expect(keys).to.eql(subprojectId);
        return {
          key: ["subprojects", subprojectId],
          resource: {
            data: {
              status: "open",
            },
            log: null,
            permissions: {
              "subproject.createWorkflowitem": ["alice"],
            },
          },
        };
      },
      getRpcClient: () => ({
        invoke: (method, streamName, keys, payload) => {
          expect(method).to.eql("publish");
          expect(streamName).to.eql(projectId);
          expect(keys).to.eql([`${subprojectId}_workflows`, workflowitemId]);

          const event = payload.json;
          expect(event.intent).to.eql("subproject.createWorkflowitem");
        },
      }),
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
});
