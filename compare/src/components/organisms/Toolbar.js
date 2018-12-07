import React from 'react';
import styled from 'styled-components';

import FiltersSwitchContainer from '../molecules/FiltersSwitch';
import TextSearchContainer from '../molecules/TextSearch';
import SettingsContainer from '../molecules/SettingsContainer';

import { colors } from '../../styles';

const ToolbarWrapper = styled.section`
  width: 100%;
  padding: 10px 30px;
  background: ${colors.bodyColor};
  height: 70px;
  display: flex;
  box-sizing: border-box;

  @media print {
    display: none;
  }
`;

export default class Toolbar extends React.Component {
  render () {
    return (
      <ToolbarWrapper style={this.props.style}>
        <FiltersSwitchContainer />
        <TextSearchContainer />
        <SettingsContainer />
      </ToolbarWrapper>
    );
  }
}
