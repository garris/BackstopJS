import React from 'react';
import styled from 'styled-components';

import { colors, fonts, shadows } from '../../styles';

const Button = styled.button`
  font-size: 20px;
  font-family: ${fonts.latoRegular};
  flex: 0 0 auto;
  margin: 0;
  background-color: ${colors.white};
  border: none;
  border-radius: 3px;
  box-shadow: ${props => (props.selected ? 'none' : shadows.shadow01)};
  color: ${colors.primaryText};
  margin-right: 15px;
  padding: 0px 30px;
  opacity: ${props => (props.selected ? '1' : '0.5')};
  outline: none;
  height: 100%;
  transition: all 0.3s ease-in-out;

  &:hover {
    cursor: pointer;
    box-shadow: ${props => (!props.selected ? shadows.shadow02 : '')};
  }

  &.pass {
    background-color: ${colors.green};
    color: ${colors.white};
  }

  &.fail {
    background-color: ${colors.red};
    color: ${colors.white};
  }
`;

export default class ButtonFilter extends React.Component {
  render () {
    const { count, label, status } = this.props;

    return (
      <Button
        onClick={this.props.onClick}
        selected={this.props.selected}
        className={status}
      >
        {status !== 'all' ? count : ''} {label}
      </Button>
    );
  }
}
