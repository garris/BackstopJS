import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { openModal } from '../../actions';

// atoms
import ImagePreview from '../atoms/ImagePreview';

const ImagesWrapper = styled.div`
  position: relative;
  display: flex;
`;

class TestImages extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      images: []
    };
  }

  onImageClick (img) {
    const { openModal } = this.props;
    this.props.info.targetImg = img;
    openModal(this.props.info);
  }

  render () {
    const { reference, test } = this.props.info;
    const { status, settings } = this.props;

    this.state.images = [
      {
        id: 'refImage',
        label: 'Reference',
        src: reference,
        visible: settings.refImage
      },
      {
        id: 'testImage',
        label: 'Test',
        src: test,
        visible: settings.testImage
      }
    ];

    if (status !== 'pass') {
      this.state.images.push({
        id: 'diffImage',
        label: 'Diff',
        src: this.props.info.diffImage,
        visible: settings.diffImage
      });
    }

    return (
      <ImagesWrapper>
        {this.state.images.map((img, i) => (
          <ImagePreview
            src={img.src}
            id={img.id}
            label={img.label}
            onClick={this.onImageClick.bind(this, img)}
            key={i}
            hidden={!img.visible}
          />
        ))}
      </ImagesWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openModal: value => {
      dispatch(openModal(value));
    }
  };
};

const TestImagesContainer = connect(mapStateToProps, mapDispatchToProps)(
  TestImages
);

export default TestImagesContainer;
