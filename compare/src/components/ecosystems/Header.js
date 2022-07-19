import React from 'react';
import styled from 'styled-components';
import { Sticky } from 'react-sticky';

import Topbar from '../organisms/Topbar';
import Toolbar from '../organisms/Toolbar';

const HeaderWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
  padding: 15px 0;
  z-index: 999;
  box-sizing: border-box;
  position: relative;
`;

export default class Header extends React.Component {
  render () {
    return (
      <HeaderWrapper className="header">
        <Topbar />
        <Sticky topOffset={72}>
          {({
            isSticky,
            wasSticky,
            style,
            distanceFromTop,
            distanceFromBottom,
            calculatedHeight
          }) => {
            return <Toolbar style={style} />;
          }}
        </Sticky>
      </HeaderWrapper>
    );
  }
}
