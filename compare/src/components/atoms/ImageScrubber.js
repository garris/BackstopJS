import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import TwentyTwenty from 'backstop-twentytwenty';
import { colors, fonts, shadows } from '../../styles';
import diverged from 'diverged';

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
console.log('ImageScrubber PROPS>>>', this.props)
    const {
      scrubberModalMode,
      testImageType,
      position,
      refImage,
      testImage,
      diffImage,
      divergedImage,
      showButtons,
      showScrubberTestImage,
      showScrubberRefImage,
      showScrubberDiffImage,
      showScrubberDivergedImage,
      showScrubber
    } = this.props;

    const scrubberTestImageSlug = this.props[testImageType];

    function getDiverged(arg) {
      if (divergedImage) {
        showScrubberDivergedImage(divergedImage);
        return;
      }

      const refImg = document.images.scrubberRefImage;
      const testImg = document.images.isolatedTestImage;

      const h = refImg.height;
      const w = refImg.width;
      const refCtx = imageToCanvasContext(refImg);
      const testCtx = imageToCanvasContext(testImg);
      
      console.log('starting diverged>>', new Date())
      const divergedImgData = diverged(getImgDataDataFromContext(refCtx), getImgDataDataFromContext(testCtx), h, w);

      let clampedImgData = getEmptyImgData(h, w)
      for (var i = divergedImgData.length - 1; i >= 0; i--) {
          clampedImgData.data[i] = divergedImgData[i];
      }
      var lcsDiffResult = imageToCanvasContext(null, w, h);
      lcsDiffResult.putImageData(clampedImgData, 0, 0);

      const divergedImageResult = lcsDiffResult.canvas.toDataURL("image/png");
      showScrubberDivergedImage(divergedImageResult);
    }

    const dontUseScrubberView = this.state.dontUseScrubberView || !showButtons;
    return (
      <Wrapper>
        <WrapTitle>
          {showButtons && (
            <div>
              <ScrubberViewBtn
                selected={scrubberModalMode === 'SHOW_SCRUBBER_REF_IMAGE'}
                onClick={showScrubberRefImage}
              >
                REFERENCE
              </ScrubberViewBtn>
              
              <ScrubberViewBtn
                selected={scrubberModalMode === 'SHOW_SCRUBBER_TEST_IMAGE'}
                onClick={showScrubberTestImage}
              >
                TEST
              </ScrubberViewBtn>

              <ScrubberViewBtn
                selected={scrubberModalMode === 'SHOW_SCRUBBER_DIFF_IMAGE'}
                onClick={showScrubberDiffImage}
              >
                DIFF
              </ScrubberViewBtn>

{/*              <ScrubberViewBtn
                selected={scrubberModalMode === 'SHOW_SCRUBBER_DIVERGED_IMAGE'}
                onClick={getDiverged}
              >
                DIVERGED
              </ScrubberViewBtn>*/}

              <ScrubberViewBtn
                selected={scrubberModalMode === 'SCRUB'}
                onClick={showScrubber}
              >
                SCRUBBER
              </ScrubberViewBtn>
            </div>
          )}
        </WrapTitle>
        <img
          id="isolatedTestImage"
          className="testImage"
          src={testImage}
          style={{
            margin: 'auto',
            display: dontUseScrubberView ? 'block' : 'none'
          }}
        />
        <img
          className="diffImage"
          src={diffImage}
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
              id="scrubberRefImage"
              className="refImage"
              src={refImage}
              onError={this.handleLoadingError}
            />
            <img
              id="scrubberTestImage" 
              className="testImage" 
              src={scrubberTestImageSlug}
            />
            <SliderBar className="slider" />
          </TwentyTwenty>
        </div>
      </Wrapper>
    );
  }
}

/**
 * ========= DIVERGED HELPERS ========
 */
function getImgDataDataFromContext(context) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
}

function getEmptyImgData(h, w) {
    var o = imageToCanvasContext(null, h, w);
    return o.createImageData(w, h);
}

function imageToCanvasContext(_img, w, h) {
    let img = _img;
    if (!_img) {
        img = { width: w, height: h };
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    if (_img) {
        context.drawImage(img, 0, 0);
    }
    return context;
}


