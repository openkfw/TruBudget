import React from "react";
import { connect } from "react-redux";

import RefreshIndicator from "./RefreshIndicator";
import Transition from "react-transition-group/Transition";

const styles = {
  container: {
    position: "relative"
  },
  content: {
    transition: `opacity 500ms ease-in-out`,
    opacity: 1
  },
  contentTransition: {
    entering: {
      opacity: 1
    },
    entered: {
      opacity: 0.2
    },
    exiting: {
      opactiy: 0.2
    },
    exited: {
      opactiy: 1
    }
  }
};

const mapStateToProps = state => {
  return {
    loading: state.getIn(["loading", "loadingVisible"])
  };
};

const withInitialLoading = ComponentToEnhance => {
  return connect(mapStateToProps)(props => {
    return (
      <div style={styles.container}>
        {props.loading ? <RefreshIndicator /> : null}
        <Transition in={props.loading} timeout={0}>
          {state => (
            <div
              style={{
                ...styles.content,
                ...styles.contentTransition[state]
              }}
            >
              <ComponentToEnhance {...props} />
            </div>
          )}
        </Transition>
      </div>
    );
  });
};

export default withInitialLoading;
