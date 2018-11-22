import { expect } from "chai";
import { TruBudgetError } from "../../error";
import { AuthenticatedRequest } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import { getSubprojectList } from "./list";
import logger from "../../lib/logger";

describe("subproject.list", () => {
  it("works", async () => {
    const projectId = "the-sample-project";
    const multichain: any = {
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql(projectId);
        let events;
        if (key === `subprojects`) {
          const subprojectOne = "one";
          const subprojectTwo = "two";
          events = [
            {
              keys: ["subprojects", subprojectOne],
              data: {
                json: {
                  key: subprojectOne,
                  intent: "project.createSubproject",
                  createdBy: "bob",
                  createdAt: "2018-05-08T11:27:00.385Z",
                  dataVersion: 1,
                  data: {
                    subproject: {
                      id: subprojectOne,
                      displayName: `Subproject ${subprojectOne}`,
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
            {
              keys: ["subprojects", subprojectTwo],
              data: {
                json: {
                  key: subprojectTwo,
                  intent: "project.createSubproject",
                  createdBy: "bob",
                  createdAt: "2018-05-08T11:28:00.385Z",
                  dataVersion: 1,
                  data: {
                    subproject: {
                      id: subprojectTwo,
                      displayName: `Subproject ${subprojectTwo}`,
                      status: "open",
                      amount: "2",
                      currency: "USD",
                      description: "",
                    },
                    permissions: {
                      "subproject.viewSummary": ["alice"],
                    },
                  },
                },
              },
            },
          ];
        } else {
          expect(true, `perhaps missing impl for key=${key}`).to.eql(false);
        }
        return events;
      },
    };

    const req = {
      query: {
        projectId: "the-sample-project",
      },
      user: {
        userId: "alice",
        groups: [] as string[],
      },
    };

    const [status, response] = await getSubprojectList(multichain as MultichainClient, req);
    expect(status).to.eql(200);
    const subprojects = (response as any).data.items;
    expect(subprojects.length).to.eql(2);

    expect(subprojects[0].data.id).to.eql("one");
    expect(subprojects[0].allowedIntents).to.eql([
      "subproject.viewSummary",
      "subproject.viewDetails",
      "subproject.close",
    ]);

    expect(subprojects[1].data.id).to.eql("two");
    expect(subprojects[1].allowedIntents).to.eql(["subproject.viewSummary"]);
  });

  it("throws stream-not-found error if the project does not exist", done => {
    const multichain: any = {
      v2_readStreamItems: async (streamName, key, nValues) => {
        expect(streamName).to.eql("the-sample-project");
        expect(key).to.eql("subprojects");
        const err: TruBudgetError = { kind: "NotFound", what: { reason: "Because it's a test." } };
        throw err;
      },
    };

    const req = {
      query: {
        projectId: "the-sample-project",
      },
      user: {
        userId: "alice",
      },
    };

    getSubprojectList(multichain as MultichainClient, req)
      .then(response => {
        logger.error({ error: {response} }, "Invalid response received.");
        throw Error(`Expected no response, got: ${JSON.stringify(response)}`);
      })
      .catch(err => {
        if (err.kind === "NotFound") {
          logger.error({ error: err }, "Getting subproject list failed.");
          done();
        } else {
          logger.error({ error: err }, "An error has occured during 'getSubprojectList'.");
          throw err;
        }
      });
  });
});
