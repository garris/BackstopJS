import React from 'react';
import styled from 'styled-components';

import Header from './ecosystems/Header';

const Wrapper = styled.section`
  padding: 0 30px;
`;

export default class App extends React.Component {
  render () {
    return (
     <Wrapper>
        <Header />
      </Wrapper>);
  }
}
