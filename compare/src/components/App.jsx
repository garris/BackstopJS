import React from 'react';

export default class App extends React.Component {
  render() {
    return (
     <div style={{textAlign: 'center'}}>
        <h1>{this.props.tests.name}</h1>
      </div>);
  }
}
