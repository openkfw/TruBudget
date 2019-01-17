import { AuthToken } from "../authz/token";
import { Notifier } from "../MultichainNotifier";
import { ProjectAssigner } from "../project";

export interface WriterFactory {
  projectAssigner(token: AuthToken): ProjectAssigner;
}

export interface NotifierCreator {
  createNotifier(token: AuthToken): Notifier;
}
