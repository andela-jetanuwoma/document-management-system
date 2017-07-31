import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { mount, render } from 'enzyme';
import configureStore from '../../stores/configureStore';
import initialState from '../../reducers/initialState';

const store = configureStore();


class TestWrapper {
  constructor() {
    this.state = initialState;
    this.props = {};
    this.child = {};
    this.componentName = '';
    this.mount = null;
  }

  mounts(Component, props = {}) {
    this.child = Component;
    this.mount = mount(
       <Provider store={store}>
         <Component {...props} />
      </Provider>
      );
    return this.mount;
  }

  renders(Component, props = {}) {
    this.child = Component;
    return render(
        <Provider store={store}>
            <Component {...this.state} {...props} />
        </Provider>
    );
  }


  call() {
    return this.mount.find(this.componentName).nodes[0];
  }

  dispatch(args) {
    return this.mount.node.props.store.dispatch(args);
  }
}


export default new TestWrapper();
