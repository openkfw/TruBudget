import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const appState = {
  run: false,
  stepIndex: 0,
  steps: [],
  tourActive: false,
  beforeStart: null,
  backButtonClicked: false,
  goToStepCheck: false
};

export const TourAppContext = createContext({
  state: appState,
  setState: () => undefined,
  goToNextStepIf: () => undefined,
  startTour: () => undefined
});
TourAppContext.displayName = "TourAppContext";

export function TourAppProvider(props) {
  const [state, setState] = useState(appState);

  const navigate = useNavigate();

  const setPartialState = useCallback((parcial) => {
    setState((prevState) => ({ ...prevState, ...parcial }));
  }, []);

  const goToNextStepIf = useCallback(() => {
    setState((prevState) => {
      if (prevState?.steps[prevState?.stepIndex]?.goToNextStepIf) {
        const { url, elementNotVisible } = prevState.steps[prevState.stepIndex].goToNextStepIf;
        const currentUrl = window.location.pathname;

        if (url && url === currentUrl) {
          return { ...prevState, stepIndex: prevState.stepIndex + 1 };
        } else {
          // due to animations it is possible that element is not visible at the moment
          setTimeout(() => {
            if (elementNotVisible && !document.querySelector(elementNotVisible)) {
              setState((prevState) => ({ ...prevState, stepIndex: prevState.stepIndex + 1 }));
            }
          }, 800);
        }
      }
      return prevState;
    });
  }, []);

  const startTour = useCallback(() => {
    // perform before start actions
    if (state.beforeStart) {
      if (Array.isArray(state.beforeStart)) {
        for (const beforeStartAction of state.beforeStart) {
          if (beforeStartAction?.navigateTo) {
            if (window.location.pathname !== beforeStartAction.navigateTo) {
              navigate(beforeStartAction.navigateTo);
            }
          }
        }
      }
    }
    setState((prevState) => ({ ...prevState, run: true, stepIndex: 0, tourActive: true }));
  }, [navigate, state.beforeStart]);

  const value = {
    state,
    setState: setPartialState,
    goToNextStepIf,
    startTour
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
