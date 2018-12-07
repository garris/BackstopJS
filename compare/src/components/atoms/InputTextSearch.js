import React from 'react';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

import searchIcon from '../../assets/icons/search.png';

const Input = styled.input`
  display: block;
  height: 100%;
  border: none;
  font-size: 16px;
  background-color: ${colors.lightGray};
  padding: 0 10px 0 55px;
  font-family: ${fonts.latoRegular};
  width: 100%;
  box-sizing: border-box;
  border-radius: 3px;
  background-image: url(${searchIcon});
  background-repeat: no-repeat;
  background-position-x: 15px;
  background-position-y: calc(100% / 2);
  background-size: 22px;

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

export default class ButtonFilter extends React.Component {
  render () {
    return (
      <Input
        placeholder="Filter tests with search..."
        onChange={this.props.onChange.bind(this)}
      />
    );
  }
}
