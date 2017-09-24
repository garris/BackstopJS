import React from 'react';
import styled from 'styled-components';

import SuiteNameContainer from '../atoms/SuiteName';

const TopbarWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
`;

export default class Topbar extends React.Component {
  render () {
    return (
      <TopbarWrapper>
        <SuiteNameContainer />
      </TopbarWrapper>
    );
  }
}
