import React from 'react';
import { connect } from 'react-redux'
import styled from 'styled-components';
// import { filterTests } from '../../actions'

import InputTextSearch from '../atoms/InputTextSearch';

import { colors, fonts } from '../../styles';

const InputWrapper = styled.div`
  flex: 1 1 auto;
`;

class TextSearch extends React.Component {

  constructor(props) {
    super(props);

  }

  render () {
    return (
      <InputWrapper>
        <InputTextSearch />
      </InputWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {

  }
};

const mapDispatchToProps = dispatch => {
  return {
    onButtonClick: status => {
      dispatch(filterTests(status))
    }
  }
}

const TextSearchContainer = connect(mapStateToProps, mapDispatchToProps)(TextSearch);

export default TextSearchContainer
