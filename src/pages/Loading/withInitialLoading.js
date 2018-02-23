import React from 'react';
import RefreshIndicatorContainer from './RefreshIndicatorContainer';
import Transition from 'react-transition-group/Transition';

const duration = 300;

const defaultStyle = {
  transition: `opacity ${duration}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
};

const styles = {
  container: {
    position: 'relative'
  },
  content: {
    filter: 'blur(2px)',
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0.5,
    entering: { opacity: 0.5 },
    entered: { opacity: 1 },
  }
}

const withInitialLoading = ComponentToEnhance => props =>
  <div style={styles.container}>
    <RefreshIndicatorContainer />
    <Transition in={props.loading} timeout={duration}>
      <div style={styles.content}>
        <ComponentToEnhance {...props} />
      </div>
    </Transition>
  </div>

export default withInitialLoading;
