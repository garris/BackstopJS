import React, { createRef } from 'react';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

import searchIcon from '../../assets/icons/search.png';
import clearIcon from '../../assets/icons/close.png';

const Input = styled.input`
  display: inline-block;
  height: 100%;
  border: none;
  font-size: 16px;
  background-color: ${colors.lightGray};
  padding: 0 10px 0 55px;
  font-family: ${fonts.latoRegular};
  width: 95%;
  box-sizing: border-box;
  border-radius: 3px;
  background-image: url(${searchIcon});
  background-repeat: no-repeat;
  background-position-x: 15px;
  background-position-y: calc(100% / 2);
  background-size: 22px;
  filter: ${colors.inversionFilter};

  &:focus {
    outline: none;
  }

  &::placeholder {
    font-family: ${fonts.arial};
    font-weight: 400;
    font-style: italic;
    color: ${colors.secondaryText};
  }
`;

const ClearButton = styled.button`
  background-color: transparent;
  display: inline-block;
  font-size: 0;
  font-family: ${fonts.latoRegular};
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 3px;
  box-shadow: ${props => (props.selected ? 'none' : colors.black)};
  color: ${colors.white};
  outline: none;
  height: 100%;
  width: 5%;
  vertical-align: top;
  transition: all 0.3s ease-in-out;

  &::before {
    content: " ";
    display: block;
    height: 100%;
    width: 100%;
    background-image: url(${clearIcon});
    background-size: 20px;
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-color: ${colors.lightGray};
    filter: ${colors.inversionFilter};
  }

  &:hover {
    cursor: pointer;
    color: ${colors.white};
  }
`;

export default class ButtonFilter extends React.Component {
  constructor (props) {
    super(props);
    this.input = createRef();
    this.escFunction = this.escFunction.bind(this);
    this.clearInput = this.clearInput.bind(this);
  }

  clearInput () {
    const ev = new Event('input', { bubbles: true });
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    ev.simulated = true;
    nativeInputValueSetter.call(this.input.current, '');
    this.input.current.dispatchEvent(ev);
    this.input.current.focus();
  }

  escFunction (event) {
    if (event.key === 'Escape') {
      this.clearInput();
    }
  }

  componentDidMount () {
    this.input.current.addEventListener('keydown', this.escFunction, false);
  }

  componentWillUnmount () {
    this.input.current.removeEventListener('keydown', this.escFunction, false);
  }

  render () {
    return (
      <>
        <Input
          placeholder="Filter test results and ref/test runs with search..."
          onChange={this.props.onChange.bind(this)}
          id="dg--filter-input"
          ref={this.input}
        />
        <ClearButton onClick={this.clearInput}>Clear</ClearButton>
      </>
    );
  }
}
