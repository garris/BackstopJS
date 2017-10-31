import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { colors, fonts } from '../../styles'

// styled
const WrapperDetails = styled.div``

const Row = styled.div`
  padding: 5px 0;
`

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`

const Value = styled.span`
  font-family ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`

class TextDetails extends React.Component {
  render() {
    const { label, fileName, selector, diff } = this.props.info
    const { settings } = this.props

    return (
      <WrapperDetails hidden={!settings.textInfo}>
        <Row>
          <Label>label: </Label>
          <Value>{label}</Value>
          <Label>selector: </Label>
          <Value>{selector}</Value>
        </Row>
        <Row>
          <Label>filename: </Label>
          <Value>{fileName}</Value>
        </Row>
        <Row>
          <Label>diff%: </Label>
          <Value>{diff.misMatchPercentage}</Value>
          <Label>diff-x: </Label>
          <Value>{diff.dimensionDifference.width}</Value>
          <Label>diff-y: </Label>
          <Value>{diff.dimensionDifference.height}</Value>
        </Row>
      </WrapperDetails>
    )
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  }
}

const TextDetailsContainer = connect(mapStateToProps)(TextDetails)

export default TextDetailsContainer
