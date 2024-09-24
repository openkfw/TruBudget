import React, { useRef } from "react";
import { connect } from "react-redux";
import Transition from "react-transition-group/Transition";

import RefreshIndicator from "./RefreshIndicator";

import "./withInitialLoading.scss";

const styles = {
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

const mapStateToProps = (state) => {
  return {
    loading: state.getIn(["loading", "loadingVisible"])
  };
};

const withInitialLoading = (ComponentToEnhance) => {
  return connect(mapStateToProps)((props) => {
    const nodeRef = useRef(null);
    return (
      <div className="with-initial-loading-container">
        {props.loading ? <RefreshIndicator /> : null}
        <Transition in={props.loading} timeout={0} nodeRef={nodeRef}>
          {(state) => (
            <div className="with-initial-loading-content" ref={nodeRef} style={styles.contentTransition[state]}>
              <ComponentToEnhance {...props} />
            </div>
          )}
        </Transition>
      </div>
    );
  });
};

export default withInitialLoading;
