import React from 'react'
import styled from 'styled-components'

import { colors, fonts } from '../../styles'

const Image = styled.img`
  width: auto;
  max-height: 150px;
`

const Wrapper = styled.div`
  flex: 1 1 auto;
  padding: 0 25px;
  padding-top: 20px;
  text-align: center;
`

const Label = styled.span`
  text-align: center;
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  display: block;
  margin: 0 auto;
  text-transform: uppercase;
  padding: 5px 0;
  padding-bottom: 15px;
  font-size: 12px;
`

export default class ImagePreview extends React.Component {
  render() {
    let { hidden } = this.props

    return (
      <Wrapper hidden={hidden}>
        <Label>{this.props.label}</Label>
        <Image {...this.props} />
      </Wrapper>
    )
  }
}
