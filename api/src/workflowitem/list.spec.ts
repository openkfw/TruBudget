import { expect } from "chai";
import { AuthenticatedRequest } from "../httpd/lib";
import { MultichainClient } from "../multichain/Client.h";
import { getWorkflowitemList } from "./list";

describe("workflowitem.list", () => {
  it("works", async () => {
    const projectId = "the-sample-project";
    const subprojectId = "the-subproject";

    const multichain: any = {
      getValue: async (streamName, key) => {
        expect(streamName).to.eql(projectId);
        expect(key).to.eql("workflowitem_ordering");
        return {
          key: [key],
          resource: {
            log: [],
            permissions: {},
            // The third workflowitem should come first, the others sorted by ctime:
            data: ["three"],
          },
        };
      },
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        expect(key).to.eql(`${subprojectId}_workflows`);
        const events = [
          {
            keys: [`${subprojectId}_workflows`, "one"],
            data: {
              json: {
                key: "one",
                intent: "subproject.createWorkflowitem",
                createdBy: "bob",
                createdAt: "2018-05-08T11:27:00.385Z",
                dataVersion: 1,
                data: {
                  workflowitem: {
                    id: "one",
                    displayName: "item one",
                    amount: "1",
                    currency: "EUR",
                    amountType: "N/A",
                    description: "",
                    status: "open",
                    documents: [],
                    assignee: undefined,
                  },
                  permissions: {
                    "workflowitem.view": ["alice"],
                    "workflowitem.assign": ["alice"],
                    "workflowitem.archive": [],
                  },
                },
              },
            },
          },
          {
            keys: [`${subprojectId}_workflows`, "one"],
            data: {
              json: {
                key: "one",
                intent: "workflowitem.assign",
                createdBy: "bob",
                createdAt: "2018-05-08T11:30:00.385Z",
                dataVersion: 1,
                data: { userId: "alice" },
              },
            },
          },
          {
            keys: [`${subprojectId}_workflows`, "one"],
            data: {
              json: {
                key: "one",
                intent: "workflowitem.close",
                createdBy: "bob",
                createdAt: "2018-05-08T11:28:00.385Z",
                dataVersion: 1,
                data: {},
              },
            },
          },
          // alice is granted the permission to archive, but she doesn't see that in the log:
          {
            keys: [`${subprojectId}_workflows`, "one"],
            data: {
              json: {
                key: "one",
                intent: "workflowitem.intent.grantPermission",
                createdBy: "bob",
                createdAt: "2018-05-08T11:29:00.385Z",
                dataVersion: 1,
                data: {
                  userId: "alice",
                  intent: "workflowitem.archive",
                },
              },
            },
          },
          {
            keys: [`${subprojectId}_workflows`, "two"],
            data: {
              json: {
                key: "two",
                intent: "subproject.createWorkflowitem",
                createdBy: "bob",
                createdAt: "2018-05-08T11:29:00.385Z",
                dataVersion: 1,
                data: {
                  workflowitem: {
                    id: "two",
                    displayName: "item two",
                    amount: "2",
                    currency: "USD",
                    amountType: "disbursed",
                    description: "some comment",
                    status: "open",
                    documents: [],
                  },
                  permissions: {
                    "workflowitem.view": ["alice"],
                    "workflowitem.assign": [],
                    "workflowitem.archive": [],
                  },
                },
              },
            },
          },
          // alice is granted the permission to list permissions, which she can also observe in the log:
          {
            keys: [`${subprojectId}_workflows`, "two"],
            data: {
              json: {
                key: "two",
                intent: "workflowitem.intent.grantPermission",
                createdBy: "bob",
                createdAt: "2018-05-08T12:28:00.385Z",
                dataVersion: 1,
                data: {
                  userId: "alice",
                  intent: "workflowitem.list.permissions",
                },
              },
            },
          },
          {
            keys: [`${subprojectId}_workflows`, "three"],
            data: {
              json: {
                key: "three",
                intent: "subproject.createWorkflowitem",
                createdBy: "bob",
                createdAt: "2018-05-08T12:29:00.385Z",
                dataVersion: 1,
                data: {
                  workflowitem: {
                    id: "three",
                    displayName: "item three",
                    amount: "3",
                    currency: "USD",
                    amountType: "disbursed",
                    description: "some comment",
                    status: "open",
                    documents: [],
                  },
                  permissions: {
                    "workflowitem.view": ["alice"],
                    "workflowitem.assign": [],
                    "workflowitem.archive": [],
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
    const workflowitems = (response as any).data.workflowitems;
    expect(workflowitems.length).to.eql(3);

    const indexOfOne = 1;
    expect(workflowitems[indexOfOne].data.id).to.eql("one");
    const one = workflowitems[indexOfOne];

    expect(one.log.length).to.eql(3);
    expect(one.log[0].key, "key = workflowitem ID").to.eql("one");
    expect(one.log[0].data.workflowitem.status, "open in 1st log").to.eql("open");
    expect(one.log[0].data.workflowitem.assignee, "assignee in 1st log").to.eql(undefined);

    expect(one.data.status).to.eql("closed");
    expect(one.data.assignee).to.eql("alice");
    expect(one.permissions, "permissions filtered out").to.eql(undefined);

    // When creating the workflowitem, Alice was not granted the permission to archive it:
    expect(one.log[0].data.permissions["workflowitem.archive"], "allowedIntents in 1st log").to.eql(
      [],
    );
    // She has been granted that permission later on:
    expect(one.allowedIntents.includes("workflowitem.archive"), "allowed by later event").to.equal(
      true,
    );
    // But she can't see that in the log as she has no permissions to list permissions:
    const isNoPermissionGrantEvent = event =>
      event.intent !== "workflowitem.intent.grantPermission";
    expect(
      one.log.every(isNoPermissionGrantEvent),
      `there should be no grantPermission event in ${JSON.stringify(one.log, null, 2)}`,
    ).to.equal(true);

    const indexOfTwo = 2;
    expect(workflowitems[indexOfTwo].data.id).to.eql("two");
    expect(workflowitems[indexOfTwo].log[0].key, "key = workflowitem ID").to.eql("two");

    const indexOfThree = 0; // comes first because of the workflowitem_ordering
    expect(workflowitems[indexOfThree].data.id).to.eql("three");
    expect(workflowitems[indexOfThree].log[0].key, "key = workflowitem ID").to.eql("three");
  });
});
