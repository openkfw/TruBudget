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
      setValue: (streamName, keys, object) => {
        expect(streamName).to.eql(projectId);
        expect(keys).to.eql([`${subprojectId}_workflows`, workflowitemId]);
        expect(object.data.id).to.eql(workflowitemId);
      },
      getValue: async (streamName, keys) => {
        expect(streamName).to.eql(projectId);
        expect(keys).to.eql(subprojectId);
        return {
          data: null,
          log: null,
          permissions: {
            "subproject.createWorkflowitem": ["alice"]
          }
        };
      }
    };

    const req = {
      method: "POST",
      body: {
        apiVersion: "1.0",
        data: {
          projectId,
          subprojectId,
          workflowitemId,
          displayName: "My Workflow-Item",
          amount: "123",
          currency: "EUR",
          amountType: "allocated",
          description: "A nice item.",
          status: "open",
          documents: []
        }
      },
      token: {
        userId: "alice"
      }
    };

    const [status, response] = await createWorkflowitem(
      multichain as MultichainClient,
      req as AuthenticatedRequest
    );
    expect(status).to.eql(201);
    expect(response).to.eql({
      apiVersion: "1.0",
      data: { created: true }
    });
  });
});
