import { ListProjects } from "../authz/intents";
import { ModelResult } from "../authz/types";
import { Project } from "./types";
import { Multichain } from "./sample";

const asProject = streamItem => /* no-op, for now */ streamItem;

export const list = (): ModelResult => ({
  kind: "resource list",
  intent: { intent: "list projects" },
  resources: Multichain.getStreams()
    .filter(s => s.details === "project")
    .map(s => s.getStreamItems())
    .reduce((acc, items) => acc.concat(items), [])
    .map(asProject)
});

// export const view = id => {
//   const proj = { title: "my proj" };
//   return { intent: Intent.ViewProject(id), resources: [proj] };
// };

// export const changeTitle = id => {
//   return {intent: Intent.ChangeProjectTile, fun: () => { /* actually change something */ };
// }
