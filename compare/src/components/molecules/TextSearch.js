import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { findTests, filterTests } from '../../actions';

import InputTextSearch from '../atoms/InputTextSearch';

const InputWrapper = styled.div`
  flex: 1 1 auto;
  height: 100%;
`;

class TextSearch extends React.Component {
  onChange (event) {
    const value = event.target.value;

    if (value.length > 0) {
      this.props.findTest(value);
    } else {
      this.props.filterTests(this.props.tests.filterStatus);
    }
  }

  render () {
    return (
      <InputWrapper>
        <InputTextSearch onChange={this.onChange.bind(this)} />
      </InputWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests
  };
};

const mapDispatchToProps = dispatch => {
  return {
    findTest: value => {
      dispatch(findTests(value));
    },
    filterTests: status => {
      dispatch(filterTests(status));
    }
  };
};

const TextSearchContainer = connect(mapStateToProps, mapDispatchToProps)(
  TextSearch
);

export default TextSearchContainer;
