import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

const IdTitle = styled.h3`
  font-size: 14px;
  font-family: ${fonts.arial};
  font-weight: normal;
  font-style: normal;
  margin: 0;
  color: ${colors.secondaryText};
  flex: 1 0 auto;
  padding-left: 15px;
  margin-left: 15px;
  margin-top: 7px;
  position: relative;

  :before {
    content: '';
    width: 2px;
    height: 35px;
    background: ${colors.borderGray};
    display: block;
    position: absolute;
    left: 0;
    top: -10px;
  }
`;

class IdConfig extends React.Component {
  render () {
    return <IdTitle>{this.props.idConfig}</IdTitle>;
  }
}

const mapStateToProps = state => {
  return {
    idConfig: state.suiteInfo.idConfig
  };
};

const IdContainer = connect(mapStateToProps)(IdConfig);

export default IdContainer;
