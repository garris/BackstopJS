import React from 'react';
import styled from 'styled-components';
import Scrollchor from 'react-scrollchor';

import {colors} from '../../styles';
import iconDown from '../../assets/icons/iconDown.png';

const Wrapper = styled.div`
  display: block;
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
  transform: ${props => props.prev ? `rotate(0)`: `rotate(180deg)`};
`;

export default class NavButtons extends React.Component {
  render () {
    let { currentId, lastId } = this.props;

    return (
      <Wrapper>
        {currentId !== 0 &&
          <Scrollchor to={`#test${this.props.currentId-1}`} animate={{offset: -188, duration: 1000}} className="nav-link">
            <ButtonNav prev/>
          </Scrollchor>
        }
        {lastId !== currentId &&
          <Scrollchor to={`#test${this.props.currentId+1}`} animate={{offset: -188, duration: 1000}} className="nav-link">
            <ButtonNav />
          </Scrollchor>
        }
      </Wrapper>
    );
  }
}

