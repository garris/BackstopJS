import React from 'react';
import styled from 'styled-components';
import TwentyTwenty from 'backstop-twentytwenty';
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

  transition: all 100ms ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    box-shadow: ${props => (!props.selected ? shadows.shadow02 : '')};
  }

  &.loadingDiverged {
    animation: blink normal 1200ms infinite ease-in-out;
    background-color: green;
  }
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.75;
    }
    100% {
      opacity: 1;
    }
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
  padding-top: 10px;
  padding-bottom: 10px;
  position: sticky;
  top: 0;
  z-index: 5;
  background: white;
  border-bottom: 1px solid #e4e4e4;

`;

const SliderBar = styled.div`
  height: 100%;
  width: 5px;
  background: ${colors.red};
  transform: translate(-2.5px, 0);
`;

export default class ImageScrubber extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isRefImageMissing: false,
      isLoading: false
    };

    this.handleRefImageLoadingError = this.handleRefImageLoadingError.bind(this);
    this.loadingDiverge = this.loadingDiverge.bind(this);
  }

  handleRefImageLoadingError () {
    this.setState({
      isRefImageMissing: true
    });
  }

  loadingDiverge (torf) {
    this.setState({
      isLoading: !!torf
    });
  }

  render () {
    const {
      scrubberModalMode,
      testImageType,
      position,
      refImage,
      testImage,
      diffImage,
      divergedImage,
      showScrubberTestImage,
      showScrubberRefImage,
      showScrubberDiffImage,
      showScrubberDivergedImage,
      showScrubber
    } = this.props;

    const scrubberTestImageSlug = this.props[testImageType];
    const hasDiff = diffImage && diffImage.length > 0;

    // only show the diverged option if the report comes from web server
    function showDivergedOption () {
      return /remote/.test(location.search);
    }

    // TODO: halp. i don't haz context.
    const that = this;

    function divergedWorker () {
      if (that.state.isLoading) {
        console.error('Diverged process is already running. Please hang on.');
        return;
      }

      if (divergedImage) {
        showScrubberDivergedImage(divergedImage);
        return;
      }

      showScrubberDivergedImage('');
      that.loadingDiverge(true);

      const refImg = document.images.isolatedRefImage;
      const testImg = document.images.isolatedTestImage;
      const h = refImg.height;
      const w = refImg.width;

      const worker = new Worker('divergedWorker.js');

      worker.addEventListener(
        'message',
        function (result) {
          const divergedImgData = result.data;
          const clampedImgData = getEmptyImgData(h, w);
          for (let i = divergedImgData.length - 1; i >= 0; i--) {
            clampedImgData.data[i] = divergedImgData[i];
          }
          const lcsDiffResult = imageToCanvasContext(null, h, w);
          lcsDiffResult.putImageData(clampedImgData, 0, 0);

          const divergedImageResult = lcsDiffResult.canvas.toDataURL(
            'image/png'
          );
          showScrubberDivergedImage(divergedImageResult);
          that.loadingDiverge(false);
        },
        false
      );

      worker.addEventListener('error', function (error) {
        showScrubberDivergedImage('');
        that.loadingDiverge(false);
        console.error(error);
      });

      worker.postMessage({
        divergedInput: [
          getImgDataDataFromContext(imageToCanvasContext(refImg)),
          getImgDataDataFromContext(imageToCanvasContext(testImg)),
          h,
          w
        ]
      });
    }

    const dontUseScrubberView = this.state.isRefImageMissing || !hasDiff;
    const showIsolatedRefImage = !hasDiff && scrubberModalMode === 'SHOW_SCRUBBER_REF_IMAGE';
    const showIsolatedTestImage = !hasDiff && scrubberModalMode === 'SHOW_SCRUBBER_TEST_IMAGE';
    return (
      <div>
        <WrapTitle>
          {hasDiff && (
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

              <ScrubberViewBtn
                selected={scrubberModalMode === 'SCRUB'}
                onClick={showScrubber}
              >
                SCRUBBER
              </ScrubberViewBtn>

              <ScrubberViewBtn
                selected={scrubberModalMode === 'SHOW_SCRUBBER_DIVERGED_IMAGE'}
                onClick={divergedWorker}
                className={this.state.isLoading ? 'loadingDiverged' : ''}
                style={{
                  display: showDivergedOption() ? '' : 'none'
                }}
              >
                {this.state.isLoading ? 'DIVERGING!' : 'DIVERGED'}
              </ScrubberViewBtn>
            </div>
          )}
        </WrapTitle>
        <Wrapper>
          <img
            id="isolatedRefImage"
            src={refImage}
            style={{
              margin: 'auto',
              display: showIsolatedRefImage ? 'block' : 'none'
            }}
          />
          <img
            id="isolatedTestImage"
            className="testImage"
            src={testImage}
            style={{
              margin: 'auto',
              display: showIsolatedTestImage ? 'block' : 'none'
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
                onError={this.handleRefImageLoadingError}
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
      </div>
    );
  }
}

/**
 * ========= DIVERGED HELPERS ========
 */
function getImgDataDataFromContext (context) {
  return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
    .data;
}

function getEmptyImgData (h, w) {
  const o = imageToCanvasContext(null, h, w);
  return o.createImageData(w, h);
}

function imageToCanvasContext (_img, h, w) {
  let img = _img;
  if (!_img) {
    img = { height: h, width: w };
  }
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const context = canvas.getContext('2d');
  if (_img) {
    context.drawImage(img, 0, 0);
  }
  return context;
}
