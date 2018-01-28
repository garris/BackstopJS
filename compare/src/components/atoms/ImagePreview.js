import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { colors, fonts } from '../../styles';

const Image = styled.img`
  width: auto;
  max-width: 100%;
  max-height: ${props => (props.settings.textInfo ? '150px' : '400px')};

  &:hover {
    cursor: pointer;
  }
`;

const Wrapper = styled.div`
  flex: 1 1 auto;
  padding: 0 25px;
  padding-top: ${props => (props.withText ? '10px' : '20px')};
  text-align: center;
`;

const Label = styled.span`
  text-align: center;
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  display: block;
  margin: 0 auto;
  text-transform: uppercase;
  padding: 5px 0;
  padding-bottom: 15px;
  font-size: 12px;
`;

class ImagePreview extends React.Component {
  render() {
    let { hidden, settings } = this.props;

    return (
      <Wrapper hidden={hidden} withText={settings.textInfo}>
        <Label>{this.props.label}</Label>
        <Image {...this.props} />
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const ImagePreviewContainer = connect(mapStateToProps)(ImagePreview);

export default ImagePreviewContainer;
