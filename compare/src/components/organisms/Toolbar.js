import React from 'react';
import styled from 'styled-components';

import FiltersSwitchContainer from '../molecules/FiltersSwitch';

const ToolbarWrapper = styled.section`
  width: 100%;
  margin: 10px auto;
`;

export default class Toolbar extends React.Component {
  render () {
    return (
      <ToolbarWrapper>
        <FiltersSwitchContainer />
      </ToolbarWrapper>
    );
  }
}
