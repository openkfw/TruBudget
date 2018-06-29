export const SWITCH_TABS = "SWITCH_TABS";

export function switchTabs(index) {
  return {
    type: SWITCH_TABS,
    index
  };
}
