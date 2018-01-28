import React from 'react';
import styled from 'styled-components';
import TwentyTwenty from 'react-twentytwenty';

import { colors, fonts, shadows } from '../../styles';

const ScrubberViewBtn = styled.button`
  margin: 1em;
  padding: 10px 16px;
  height: 32px;
  background-color: ${props =>
    props.selected ? colors.secondaryText : colors.lightGray};
  color: ${props => (props.selected ? colors.lightGray : colors.secondaryText)};
  border-radius: 3px;
  text-transform: uppercase;
  font-family: ${fonts.latoRegular};
  text-align: center;
  font-size: 12px;
  border: none;
  box-shadow: ${props => (props.selected ? 'none' : shadows.shadow01)};

  transition: all 0.3s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    box-shadow: ${props => (!props.selected ? shadows.shadow02 : '')};
  }
`;

const Wrapper = styled.div`
  height: 100%;
  cursor: ew-resize;
  padding-bottom: 20px;
  overflow: auto;

  .slider {
    height: 100%;
    width: 5px;
    background: ${colors.red};
  }

  .testImage {
    opacity: 1;
  }

  .testImage,
  .refImage {
    width: 100%;
  }
`;

const WrapTitle = styled.div`
  display: flex;
  justify-content: center;
`;

export default function ImageScrubber({
  position,
  refImage,
  testImage,
  showButtons,
  showScrubberTestImage,
  showScrubberRefImage,
  showScrubber
}) {
  return (
    <Wrapper>
      <WrapTitle>
        {showButtons && (
          <div>
            <ScrubberViewBtn
              selected={position === 100}
              onClick={() => {
                showScrubberRefImage();
              }}
            >
              REFERENCE
            </ScrubberViewBtn>
            <ScrubberViewBtn
              selected={position === 0}
              onClick={() => {
                showScrubberTestImage();
              }}
            >
              TEST
            </ScrubberViewBtn>
            <ScrubberViewBtn
              selected={position !== 100 && position !== 0}
              onClick={() => {
                showScrubber();
              }}
            >
              SCRUBBER
            </ScrubberViewBtn>
          </div>
        )}
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
  );
  // }
}
