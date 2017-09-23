import React from 'react';
import styled from 'styled-components';

import Topbar from '../organisms/topbar';
import Toolbar from '../organisms/Toolbar';

const HeaderWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
`;

export default class Header extends React.Component {
  render () {
    return (
      <HeaderWrapper>
        <Topbar />
        <Toolbar />
      </HeaderWrapper>
    );
  }
}
