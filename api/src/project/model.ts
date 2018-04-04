import { ListProjects } from "../authz/intents";
import { ModelResult } from "../authz/types";
import { MultichainClient, ProjectMetadata, Stream } from "../multichain";

export interface Project {
  creationUnixTs: string;
  status: "open" | "in progress" | "done";
  name: string;
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
}

const asProject = (meta: ProjectMetadata): Project => {
  return {
    creationUnixTs: meta.creationUnixTs,
    status: meta.status,
    name: meta.name,
    description: meta.description,
    amount: meta.amount,
    currency: meta.currency,
    thumbnail: meta.thumbnail
  };
};

export class ProjectModel {
  multichain: MultichainClient;
  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }
  async list(): Promise<ModelResult> {
    const streams: Stream[] = await this.multichain.streams();
    const projects = (await Promise.all<ProjectMetadata>(
      streams
        .filter(stream => stream.details.kind === "project")
        .map(stream => this.multichain.metadata(stream))
    )).map(asProject);
    return {
      kind: "resource list",
      intent: { intent: "list projects" },
      resources: projects
    };
  }
}

// export const view = id => {
//   const proj = { title: "my proj" };
//   return { intent: Intent.ViewProject(id), resources: [proj] };
// };

// export const changeTitle = id => {
//   return {intent: Intent.ChangeProjectTile, fun: () => { /* actually change something */ };
// }
