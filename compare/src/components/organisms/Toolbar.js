import React from 'react';
import styled from 'styled-components';

import FiltersSwitchContainer from '../molecules/FiltersSwitch';
import TextSearchContainer from '../molecules/TextSearch';

const ToolbarWrapper = styled.section`
  width: 100%;
  margin: 10px auto;
  display: flex;
`;

export default class Toolbar extends React.Component {
  render () {
    return (
      <ToolbarWrapper>
        <FiltersSwitchContainer />
        <TextSearchContainer />
      </ToolbarWrapper>
    );
  }
}
