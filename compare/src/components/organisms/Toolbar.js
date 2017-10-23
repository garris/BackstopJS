import React from 'react'
import styled from 'styled-components'

import FiltersSwitchContainer from '../molecules/FiltersSwitch'
import TextSearchContainer from '../molecules/TextSearch'
import SettingsContainer from '../molecules/SettingsContainer'

const ToolbarWrapper = styled.section`
  width: 100%;
  margin: 10px auto;
  height: 60px;
  display: flex;
`

export default class Toolbar extends React.Component {
  render() {
    return (
      <ToolbarWrapper>
        <FiltersSwitchContainer />
        <TextSearchContainer />
        <SettingsContainer />
      </ToolbarWrapper>
    )
  }
}
