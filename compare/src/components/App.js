import React from 'react';
import styled from 'styled-components';
// ESLint
/* eslint-disable no-unused-vars */
import { StickyContainer } from 'react-sticky';

import Header from './ecosystems/Header';
import List from './ecosystems/List';
import ScrubberModal from './ecosystems/ScrubberModal';

const Wrapper = styled.section`
  padding: 0 30px;
`;

export default class App extends React.Component {
  render () {
    return (
      <StickyContainer>
        <Header />
        <Wrapper>
          <List />
        </Wrapper>
        <ScrubberModal />
      </StickyContainer>
    );
  }
}
