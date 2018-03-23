import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import TwentyTwenty from 'backstop-twentytwenty';
import { colors, fonts, shadows } from '../../styles';

const BASE64_PNG_STUB =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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
  cursor: ew-resize;
  padding-bottom: 20px;
  overflow: hidden;

  .testImage {
    opacity: 1;
  }

  .testImage,
  .refImage {
    max-width: 100%;
  }
`;

const WrapTitle = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
`;

const SliderBar = styled.div`
  height: 100%;
  width: 5px;
  background: ${colors.red};
  transform: translate(-2.5px, 0);
`;

export default class ImageScrubber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dontUseScrubberView: false
    };

    this.handleLoadingError = this.handleLoadingError.bind(this);
  }

  handleLoadingError() {
    this.setState({
      dontUseScrubberView: true
    });
  }

  render() {
    const {
      position,
      refImage,
      testImage,
      showButtons,
      showScrubberTestImage,
      showScrubberRefImage,
      showScrubber
    } = this.props;

    const dontUseScrubberView = this.state.dontUseScrubberView || !showButtons;

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
        <img
          className="testImage"
          src={testImage}
          style={{
            margin: 'auto',
            display: dontUseScrubberView ? 'block' : 'none'
          }}
        />
        <div
          style={{
            display: dontUseScrubberView ? 'none' : 'block'
          }}
        >
          <TwentyTwenty
            verticalAlign="top"
            minDistanceToBeginInteraction={0}
            maxAngleToBeginInteraction={Infinity}
            initialPosition={position}
            newPosition={position}
          >
            <img
              className="refImage"
              src={refImage}
              onError={this.handleLoadingError}
            />
            <img className="testImage" src={testImage} />
            <SliderBar className="slider" />
          </TwentyTwenty>
        </div>
      </Wrapper>
    );
  }
}

// const mapStateToProps = state => {
//   console.log('map state>>>',state)
//   return {
//     test_: state
//   };
// };

// const ImageScrubberContainer = connect(mapStateToProps)(ImageScrubber);
