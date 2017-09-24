import React from 'react';
import { connect } from 'react-redux'
import styled from 'styled-components';


const SuiteNameTitle = styled.h1`
  font-size: 30px;
`;

class SuiteName extends React.Component {
  render () {
    return (
      <SuiteNameTitle>{this.props.suiteName} Report</SuiteNameTitle>
    );
  }
}

const mapStateToProps = state => {
  return {
    suiteName: state.suiteInfo.testSuiteName
  }
};

const SuiteNameContainer = connect(mapStateToProps)(SuiteName);

export default SuiteNameContainer
