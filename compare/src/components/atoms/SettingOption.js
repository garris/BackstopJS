import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import ToggleButton from 'react-toggle-button'

import { colors, fonts, shadows } from '../../styles'

const WrapperOption = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;

  span {
    padding-left: 10px;
    font-family: ${fonts.latoRegular};
    color: ${colors.primaryText};
    font-size: 14px;
  }
`

export default class SettingOption extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value
    }
  }

  render() {
    let { label, value, onToggle } = this.props

    return (
      <WrapperOption>
        <ToggleButton value={value || false} onToggle={onToggle} />

        <span>{label}</span>
      </WrapperOption>
    )
  }
}
