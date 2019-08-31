import React from 'react';
import styled from 'styled-components';

import jump from 'jump.js';

import { colors } from '../../styles';
import iconDown from '../../assets/icons/iconDown.png';

const Wrapper = styled.div`
  display: flex;
  position: absolute;
  top: 15px;
  right: 10px;

  a {
    display: inline-block;
  }
`;

const ButtonNav = styled.div`
  background-color: ${colors.lightGray};
  background-image: url(${iconDown});
  background-repeat: no-repeat;
  background-position: center center;
  color: ${colors.secondaryText};
  border-radius: 3px;
  height: 32px;
  width: 32px;
  margin: 0 5px;
  transform: ${props => (props.prev ? `rotate(0)` : `rotate(180deg)`)};

  &:hover {
    cursor: pointer;
  }
`;

export default class NavButtons extends React.Component {
  nextTest () {
    let dest = `#test${this.props.currentId + 1}`;
    this.jumpTo(dest);
  }

  prevTest () {
    let dest = `#test${this.props.currentId - 1}`;
    this.jumpTo(dest);
  }

  jumpTo (dest) {
    jump(dest, {
      duration: 0,
      offset: -100
    });
  }

  render () {
    let { currentId, lastId } = this.props;

    return (
      <Wrapper>
        {currentId !== 0 && (
          <ButtonNav onClick={this.prevTest.bind(this)} prev />
        )}
        {lastId !== currentId && (
          <ButtonNav onClick={this.nextTest.bind(this)} />
        )}
      </Wrapper>
    );
  }
}
