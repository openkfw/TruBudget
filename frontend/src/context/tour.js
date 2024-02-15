import React, { createContext, useCallback, useContext, useState } from "react";

const appState = {
  run: false,
  stepIndex: 0,
  steps: [],
  tourActive: false
};

export const TourAppContext = createContext({
  state: appState,
  setState: () => undefined
});
TourAppContext.displayName = "TourAppContext";

export function TourAppProvider(props) {
  const [state, setState] = useState(appState);

  const setPartialState = useCallback((parcial) => {
    setState((prevState) => ({ ...prevState, ...parcial }));
  }, []);

  const value = {
    state,
    setState: setPartialState
  };

  return <TourAppContext.Provider value={value} {...props} />;
}

export function useTourAppContext() {
  const context = useContext(TourAppContext);

  if (!context) {
    throw new Error("useTourAppContext must be used within a TourAppProvider");
  }

  return context;
}
