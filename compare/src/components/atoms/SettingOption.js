import React from 'react';
import styled from 'styled-components';
import ToggleButton from 'react-toggle-button';

import { colors, fonts } from '../../styles';

const WrapperOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;

  span {
    padding-right: 10px;
    text-align: left;
    font-family: ${fonts.latoRegular};
    color: ${colors.primaryText};
    font-size: 14px;
  }
`;

export default class SettingOption extends React.Component {
  render () {
    const { label, value, onToggle } = this.props;

    return (
      <WrapperOption>
        <span>{label}</span>

        <ToggleButton value={value || false} onToggle={onToggle} />
      </WrapperOption>
    );
  }
}
