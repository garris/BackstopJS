import React from 'react';
import { connect } from 'react-redux'
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

const Button = styled.button`
  font-size: 20px;
  font-family: ${fonts.latoRegular};
  flex: 0 0 auto;
  margin: 0;
  background-color: ${colors.white};
  border: none;
  border-radius: 3px;
  box-shadow: ${props => props.selected ? 'none' : '0 3px 6px 0 rgba(0,0,0,0.16)'};
  color: ${colors.primaryText};
  margin-right: 15px;
  padding: 0px 30px;
  opacity: ${props => props.selected ? '0.6' : '1'};
  outline: none;
  height: 100%;

  &:hover {
    cursor: pointer;
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
    let count = this.props.count;
    let label = this.props.label;
    let status = this.props.status;

    return (
      <Button onClick={this.props.onClick} selected={this.props.selected} className={status}>{status !== 'all' ? count: ''} {label}</Button>
    );
  }
}
