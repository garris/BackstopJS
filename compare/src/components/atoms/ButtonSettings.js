import React from 'react';
import styled from 'styled-components';

import { colors, fonts, shadows } from '../../styles';

import settingsIcon from '../../assets/icons/settings.png';

const Button = styled.button`
  border: none;
  height: 100%;
  border-radius: 3px;
  background: ${colors.lightGray};
  margin-left: 15px;
  padding: 0 20px;
  box-shadow: ${shadows.shadow01};
  transition: all 0.3s ease-in-out;

  &.active {
    box-shadow: none;
    opacity: 0.6;
  }

  &:hover {
    cursor: pointer;
    box-shadow: ${props => (!props.selected ? shadows.shadow02 : '')};
  }

  &:focus {
    outline: none;
  }

  .icon {
    height: 18px;
    width: 18px;
    display: block;
    background-image: url(${settingsIcon});
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    margin: 0 auto;
    padding-bottom: 5px;
  }

  .label {
    font-family: ${fonts.latoRegular};
    color: ${colors.secondaryText};
  }
`;

export default class ButtonSettings extends React.Component {
  render () {
    const isActive = this.props.active ? 'active' : '';

    return (
      <Button onClick={this.props.onClick} className={isActive}>
        <span className="icon" />
        {/* <span className="label">settings</span> */}
      </Button>
    );
  }
}
