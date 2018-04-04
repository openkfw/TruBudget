import { ListProjects } from "../authz/intents";
import { ModelResult } from "../authz/types";
import { Project } from "./types";
import { Multichain as DummyMultichain } from "./sample";
import MultichainClient, { Stream } from "../multichain";

const asProject = streamItem => /* no-op, for now */ streamItem;

class ProjectModel {
  multichain: MultichainClient;
  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }
  async list(): Promise<ModelResult> {
    const streams: Array<Stream> = await this.multichain.streams();
    const projects = streams.filter(s => s.details);
    console.log(JSON.stringify(streams));
    return {
      kind: "resource list",
      intent: { intent: "list projects" },
      resources: DummyMultichain.getStreams()
        .filter(s => s.details === "project")
        .map(s => s.getStreamItems())
        .reduce((acc, items) => acc.concat(items), [])
        .map(asProject)
    };
  }
}

export default ProjectModel;

// export const view = id => {
//   const proj = { title: "my proj" };
//   return { intent: Intent.ViewProject(id), resources: [proj] };
// };

// export const changeTitle = id => {
//   return {intent: Intent.ChangeProjectTile, fun: () => { /* actually change something */ };
// }
