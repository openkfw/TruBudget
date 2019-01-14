import { assert } from "chai";

import { ProjectReader, ProjectService } from ".";
import Intent from "../authz/intents";
import { Project } from "./Project";
import { User } from "./User";

function newProject(id: string, permissions: object): Project {
  return {
    id,
    creationUnixTs: `${new Date().getTime()}`,
    status: "open",
    displayName: "A test project",
    assignee: "my-user",
    description: "This is a project created for, and during, testing.",
    amount: "1234",
    currency: "EUR",
    thumbnail: "",
    permissions,
  };
}

describe("The Project Service", () => {
  it("filters the list of projects according to the user's permissions.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const viewIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
    for (const viewIntent of viewIntents) {
      const projectVisibleToBob = newProject("bob", { [viewIntent]: ["bob"] });
      const projectVisibleToFriends = newProject("friends", { [viewIntent]: ["friends"] });
      const nonVisibleProject = newProject("hidden", {});

      const projects = [projectVisibleToBob, projectVisibleToFriends, nonVisibleProject];

      const reader: ProjectReader = {
        projectList() {
          return Promise.resolve(projects);
        },
      };
      const service = new ProjectService(reader);

      const visibleProjects = await service.projectList(user);

      assert.equal(visibleProjects.length, 2);
      assert.equal(visibleProjects[0].id, "bob");
      assert.equal(visibleProjects[1].id, "friends");
    }
  });
});
