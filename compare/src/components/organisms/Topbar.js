import React from 'react';
import styled from 'styled-components';

import { colors } from '../../styles';

import SuiteNameContainer from '../atoms/SuiteName';
import IdContainer from '../atoms/IdContainer';
import Logo from '../atoms/Logo';

const TopbarWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
  display: flex;
  padding: 10px 0;
  align-items: center;
  border-bottom: solid 3px ${colors.borderGray}
`;

export default class Topbar extends React.Component {
  render () {
    return (
      <TopbarWrapper>
        <SuiteNameContainer />
        <IdContainer />
        <Logo />
      </TopbarWrapper>
    );
  }
}
