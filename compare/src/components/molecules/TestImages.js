import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { colors, shadows } from '../../styles';

// atoms
import ImagePreview from '../atoms/ImagePreview';

const ImagesWrapper = styled.div`
  position: relative;
  display: flex;
  padding-top: 20px;
`;

class TestImages extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      images: []
    };
  }

  render () {
    let { reference, test } = this.props.info;
    let { status, settings } = this.props;

    this.state.images = [
      {
        id: "refImage",
        label: "Reference",
        src: reference,
        visible: settings.refImage
      },
      {
        id: "testImage",
        label: "Test",
        src: test,
        visible: settings.testImage
      }
    ];

    if(status !== 'pass') {
      this.state.images.push({
        id: "diffImage",
        label: "Diff",
        src: this.props.info.diffImage,
        visible: settings.diffImage
      })
    }

    return (
      <ImagesWrapper>
        {this.state.images.map((img, i) =>
          <ImagePreview src={img.src} id={img.id} label={img.label} key={i} hidden={!img.visible} />
        )}
      </ImagesWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  }
};

const TestImagesContainer = connect(mapStateToProps)(TestImages);

export default TestImagesContainer
