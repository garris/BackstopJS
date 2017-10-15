import React from 'react';
import { connect } from 'react-redux'
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

  &.active {
    box-shadow: none;
    opacity: 0.6;
  }

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }

  .icon {
    height: 16px;
    width: 16px;
    display: block;
    background-image: url(${settingsIcon});
    background-size: 100%;
    background-repeat: no-repeat;
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
    let isActive = this.props.active ? 'active' : '';

    return (
      <Button onClick={this.props.onClick} className={isActive}>
        <span className="icon"></span>
        <span className="label">settings</span>
      </Button>
    );
  }
}
