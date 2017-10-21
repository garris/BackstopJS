import React from 'react';
import styled from 'styled-components';
import { StickyContainer, Sticky } from 'react-sticky';


import Topbar from '../organisms/topbar';
import Toolbar from '../organisms/Toolbar';

import { colors } from '../../styles';

const HeaderWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
  padding: 15px 30px;
  background: ${colors.bodyColor};
  z-index: 999;
  box-sizing: border-box;
  position: relative;
`;

export default class Header extends React.Component {
  render () {
    return (
        <HeaderWrapper style={this.props.style} className="header">
          <Topbar />
          <Toolbar />
        </HeaderWrapper>
    );
  }
}
