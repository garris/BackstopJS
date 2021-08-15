import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../styles';

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`;

const Value = styled.span`
  font-family: ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`;

export default class DiffDetails extends React.Component {
  render () {
    const { diff, suppress } = this.props;
    if (!diff || suppress) {
      return null;
    }

    return (
      <span>
        <Label>diff%: </Label>
        <Value>{diff.misMatchPercentage} </Value>
        <Label>diff-x: </Label>
        <Value>{diff.dimensionDifference.width} </Value>
        <Label>diff-y: </Label>
        <Value>{diff.dimensionDifference.height} </Value>
      </span>
    );
  }
}
