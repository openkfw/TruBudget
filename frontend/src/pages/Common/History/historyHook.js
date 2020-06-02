import { useState, useEffect } from "react";

let listeners = [];
const defaultState = {
  startAt: "",
  endAt: "",
  publisher: "",
  eventType: ""
};
let state = {
  ...defaultState
};

const mergeState = newState => {
  state = { ...state, ...newState };
  listeners.forEach(listener => {
    listener(state);
  });
};

const clearState = () => {
  state = defaultState;
  listeners.forEach(listener => {
    listener(state);
  });
};

const useHistoryState = () => {
  const newListener = useState()[1];
  useEffect(() => {
    listeners.push(newListener);
  }, [newListener]);
  useEffect(() => {
    // cleanup
    return () => {
      clearState();
      listeners = [];
    };
  }, []);
  return [state, mergeState, clearState];
};

export default useHistoryState;
