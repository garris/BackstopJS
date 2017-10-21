import React from 'react';
import styled from 'styled-components';
import TwentyTwenty from 'react-twentytwenty';

import { colors, fonts } from '../../styles';

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
    opacity: 0.7;
  }
`;

const WrapTitle = styled.div`
  display: flex;
`;

const Title = styled.h3`
  flex-basis: 50%;
  text-align: center;
  font-family: ${fonts.latoBold};
  color: ${colors.primaryText};
`;

export default class ImageScrubber extends React.Component {

  render () {
    return (
        <Wrapper>
          <WrapTitle>
            <Title>REFERENCE</Title>
            <Title>TEST</Title>
          </WrapTitle>
          <TwentyTwenty
            verticalAlign="top"
            minDistanceToBeginInteraction={0}
            maxAngleToBeginInteraction={Infinity} >
              <img className="refImage" src={this.props.refImage} />
              <img className="testImage" src={this.props.testImage} />
              <div className="slider" />
          </TwentyTwenty>
        </Wrapper>
    );
  }
}
