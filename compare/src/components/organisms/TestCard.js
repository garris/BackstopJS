import React from 'react';
import styled from 'styled-components';

import { colors, shadows } from '../../styles';

// atoms
import ErrorMessages from '../atoms/ErrorMessages';
import TextDetails from '../atoms/TextDetails';
import NavButtons from '../atoms/NavButtons';

// molecules
import TestImages from '../molecules/TestImages';

const CardWrapper = styled.div`
  position: relative;
  margin: 5px auto;
  padding: 10px 30px;
  background-color: ${colors.cardWhite};
  box-shadow: ${shadows.shadow01};
  min-height: 40px;
  break-inside: avoid;

  &:before {
    content: '';
    display: block;
    width: 8px;
    height: 100%;
    background-color: ${props => props.status === 'pass' ? colors.green : colors.red};
    position: absolute;
    top: 0;
    left: 0;
  }
  @media print {
    box-shadow: none;
  }
`;

export default class TestCard extends React.Component {
  render () {
    let { pair: info, status } = this.props.test;
    let onlyText = this.props.onlyText;

    return (
      <CardWrapper id={this.props.id} status={status}>
        {!onlyText && (
          <NavButtons currentId={this.props.numId} lastId={this.props.lastId} />
        )}
        <TextDetails info={info} />
        <TestImages info={info} status={status} />
        <ErrorMessages info={info} status={status} />
      </CardWrapper>
    );
  }
}
