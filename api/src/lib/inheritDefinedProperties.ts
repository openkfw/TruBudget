import deepcopy from "./deepcopy";
import { isEmpty } from "./emptyChecks";

export function inheritDefinedProperties(dst: object, src: object, properties?: string[]): void {
  if (isEmpty(src)) return;
  (properties || Object.keys(src)).forEach(prop => {
    const val = src[prop];
    if (isEmpty(val)) return;
    dst[prop] = deepcopy(val);
  });
}
