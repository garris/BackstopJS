import React from 'react';
import styled from 'styled-components';
import { StickyContainer, Sticky } from 'react-sticky';

import Header from './ecosystems/Header';
import List from './ecosystems/List';

const Wrapper = styled.section`
  padding: 0 30px;
`;

export default class App extends React.Component {
  render () {
    return (
    <StickyContainer>
      <Sticky topOffset={200}>
            {
              ({ isSticky, wasSticky, style, distanceFromTop, distanceFromBottom, calculatedHeight }) => {
                console.log({ isSticky, wasSticky, style, distanceFromTop, distanceFromBottom, calculatedHeight });
                return <Header style={style} />
              }
            }
      </Sticky>
      <Wrapper>
        <List />
      </Wrapper>
    </StickyContainer>
      );
  }
}
