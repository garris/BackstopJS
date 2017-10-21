import React from 'react';
import { connect } from 'react-redux'
import styled from 'styled-components';
import { findTests } from '../../actions'

import InputTextSearch from '../atoms/InputTextSearch';

import { colors, fonts } from '../../styles';

const InputWrapper = styled.div`
  flex: 1 1 auto;
  height: 100%;
`;

class TextSearch extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <InputWrapper>
        <InputTextSearch onChange={this.props.onChange} />
      </InputWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests
  }
};

const mapDispatchToProps = dispatch => {
  return {
    onChange: value => {
      dispatch(findTests(value))
    }
  }
}

const TextSearchContainer = connect(mapStateToProps, mapDispatchToProps)(TextSearch);

export default TextSearchContainer
