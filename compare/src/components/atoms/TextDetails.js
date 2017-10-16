import React from 'react';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

// styled
const WrapperDetails = styled.div`
`;

const Row = styled.div`
  padding: 5px 0;
`;

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`;

const Value = styled.span`
  font-family ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`;

export default class TextDetails extends React.Component {

  render () {
    let { label, fileName, selector, diff } = this.props.info;

    return (
      <WrapperDetails>
        <Row>
          <Label>label: </Label>
          <Value>{label}</Value>
          <Label>selector: </Label>
          <Value>{selector}</Value>
        </Row>
        <Row>
          <Label>filename: </Label>
          <Value>{fileName}</Value>
        </Row>
        <Row>
          <Label>diff%: </Label>
          <Value>{diff.misMatchPercentage}</Value>
          <Label>diff-x: </Label>
          <Value>{diff.dimensionDifference.width}</Value>
          <Label>diff-y: </Label>
          <Value>{diff.dimensionDifference.height}</Value>
        </Row>
      </WrapperDetails>
    );
  }
}
