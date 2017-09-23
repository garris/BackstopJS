import React from 'react';
import styled from 'styled-components';


const ToolbarWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
`;

export default class Toolbar extends React.Component {
  render () {
    return (
      <ToolbarWrapper>
        <p>Filter</p>
      </ToolbarWrapper>
    );
  }
}
