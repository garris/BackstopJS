import React from 'react';
import styled from 'styled-components';

import { colors, shadows } from '../../styles';

// atoms
import TextDetails from '../atoms/TextDetails';

const CardWrapper = styled.div`
  position: relative;
  margin: 10px auto;
  min-height: 200px;
  padding: 30px;
  background-color: ${colors.white};
  box-shadow: ${shadows.shadow01};

  &:before {
    content: '';
    display: block;
    width: 5px;
    height: 100%;
    background-color: ${props => props.status === 'pass' ? colors.green : colors.red};
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export default class TestCard extends React.Component {
  render () {
    let { pair: info, status } = this.props.test;

    return (
      <CardWrapper status={status} >
        <TextDetails info={info} />
      </CardWrapper>
    );
  }
}
