import React from 'react';
import styled from 'styled-components';
import { ImageCompare, ImageCompareScroll } from 'react-image-compare';

import { colors, fonts } from '../../styles';

const Wrapper = styled.div`
  height: 100%
`;

const img1    = 'img/before.jpg';
const img2    = 'img/after.jpg';

let compareStylesScroll = { borderRight: '3px dotted yellow' };
let compareStylesManual = { borderBottom: `3px dotted yellow` };


export default class ImageScrubber extends React.Component {

  render () {
    return (
        <Wrapper>
          <ImageCompareScroll
              srcOver={this.props.refImage}
              srcUnder={this.props.testImage}
              vertical={true}
              styles={compareStylesManual}
            />
        </Wrapper>
    );
  }
}
