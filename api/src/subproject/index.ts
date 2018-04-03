import { ModelResult } from "../authz/types";
// import { Intent } from "../authz/intents";
import { Project } from "../project/types";
import { someSubProjects } from "./sample";

export const list = project => ({
  intent: "view subproject", // TODO should break
  resources: someSubProjects
});

export const create = (projectId, title): ModelResult => ({
  kind: "side effect",
  intent: { intent: "append subproject to project", projectId },
  action: () =>
    console.log(
      `!! would create subproject "${title}" for project "${projectId}" !!`
    )
});
