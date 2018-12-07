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
  padding: 0 30px;
  align-items: center;
  box-sizing: border-box;
  flex-wrap: wrap;
`;

const Separator = styled.div`
  width: 100%;
  height: 3px;
  background: ${colors.borderGray};
  flex-basis: 100%;
  margin: 10px 0;
`;

export default class Topbar extends React.Component {
  render () {
    return (
      <TopbarWrapper>
        <SuiteNameContainer />
        <IdContainer />
        <Logo />
        <Separator />
      </TopbarWrapper>
    );
  }
}
