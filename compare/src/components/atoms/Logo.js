import React from 'react';
import styled from 'styled-components';

import LogoImg from '../../assets/images/logo.png';

const LogoImage = styled.img`
  display: block;
  height: 35px;
`;

export default class Logo extends React.Component {
  render() {
    return <LogoImage src={LogoImg} />;
  }
}
