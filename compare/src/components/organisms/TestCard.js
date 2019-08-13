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
  padding: 10px 22px;
  background-color: ${colors.cardWhite};
  box-shadow: ${shadows.shadow01};
  min-height: 40px;
  break-inside: avoid;
  border-left: 8px solid transparent;
  border-left-color: ${props => props.status === 'pass' ? colors.green : colors.red};

  @media print {
    box-shadow: none;
  }
`;

const CardHeader = styled.div`
  display: flex;
`;

export default class TestCard extends React.Component {
  render () {
    let { pair: info, status } = this.props.test;
    let onlyText = this.props.onlyText;

    return (
      <CardWrapper id={this.props.id} status={status}>
        <CardHeader>
          <TextDetails info={info} />
          {!onlyText && (
            <NavButtons currentId={this.props.numId} lastId={this.props.lastId} />
          )}
        </CardHeader>
        <TestImages info={info} status={status} />
        <ErrorMessages info={info} status={status} />
      </CardWrapper>
    );
  }
}
