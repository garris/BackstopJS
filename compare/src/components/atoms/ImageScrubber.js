import React from 'react'
import styled from 'styled-components'
import TwentyTwenty from 'react-twentytwenty'

import { colors, fonts } from '../../styles'

const Wrapper = styled.div`
  height: 100%;
  cursor: ew-resize;
  padding-top: 40px;
  padding-bottom: 20px;

  .slider {
    height: 100%;
    width: 5px;
    background: ${colors.red};
  }

  .testImage {
    opacity: 1;
  }
`

const WrapTitle = styled.div`
  display: flex;
`

const Title = styled.h3`
  flex-basis: 50%;
  text-align: center;
  font-family: ${fonts.latoBold};
  color: ${colors.primaryText};
`

export default function ImageScrubber({
  position,
  refImage,
  testImage,
  showScrubberTestImage
}) {
  // render() {
  console.log('hiya>>>', showScrubberTestImage)
  return (
    <Wrapper>
      <WrapTitle>
        <Title>REFERENCE</Title>
        <button
          onClick={() => {
            console.log('>>> fire')
            showScrubberTestImage()
          }}
        >
          TEST
        </button>
      </WrapTitle>
      <TwentyTwenty
        verticalAlign="top"
        minDistanceToBeginInteraction={0}
        maxAngleToBeginInteraction={Infinity}
        initialPosition={position}
        newPosition={position}
      >
        <img className="refImage" src={refImage} />
        <img className="testImage" src={testImage} />
        <div className="slider" />
      </TwentyTwenty>
    </Wrapper>
  )
  // }
}
