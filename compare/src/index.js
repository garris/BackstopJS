import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';

const tests = {
  name: window.tests.testSuite
};

ReactDOM.render(<App tests={tests}/>, document.getElementById('root'));
