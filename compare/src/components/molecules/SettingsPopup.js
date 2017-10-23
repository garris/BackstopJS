import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { updateSettings } from '../../actions'

import { colors, fonts, shadows } from '../../styles'

import SettingOption from '../atoms/SettingOption'

const PopupWrapper = styled.div`
  display: block;
  position: absolute;
  width: auto;
  min-height: 100px;
  background-color: ${colors.lightGray};
  box-shadow: ${shadows.shadow01};
  right: 38px;
  margin-top: 20px;
  border-radius: 3px;
  padding: 10px 25px;
  z-index: 10;

  /* @TODO: shadow on arrow */
  &:before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;

    border-top: 8px solid transparent;
    border-bottom: 8px solid ${colors.lightGray};
    border-right: 8px solid transparent;
    border-left: 8px solid transparent;
    right: 30px;
    top: -16px;
  }
`

class SettingsPopup extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { onToggle, settings } = this.props

    return (
      <PopupWrapper>
        <SettingOption
          id="refImage"
          label="Reference image"
          value={settings.refImage}
          onToggle={onToggle.bind(null, 'refImage')}
        />
        <SettingOption
          id="testImage"
          label="Test image"
          value={settings.testImage}
          onToggle={onToggle.bind(null, 'testImage')}
        />
        <SettingOption
          id="diffImage"
          label="Diff image"
          value={settings.diffImage}
          onToggle={onToggle.bind(null, 'diffImage')}
        />
      </PopupWrapper>
    )
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onToggle: id => {
      dispatch(updateSettings(id))
    }
  }
}

const PopupContainer = connect(mapStateToProps, mapDispatchToProps)(
  SettingsPopup
)

export default PopupContainer
