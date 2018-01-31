import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Modal from 'react-modal';
import {
  closeModal,
  showScrubberTestImage,
  showScrubberRefImage,
  showScrubber
} from '../../actions';

// styles & icons
import { colors, fonts, shadows } from '../../styles';
import iconClose from '../../assets/icons/close.png';

// atoms
import Logo from '../atoms/Logo';
import TextDetails from '../atoms/TextDetails';
import ImageScrubber from '../atoms/ImageScrubber';

const Wrapper = styled.div`
  display: block;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 15px;
  align-items: center;
`;

const ButtonClose = styled.button`
  margin-right: 5px;
  width: 30px;
  height: 30px;
  background-image: url(${iconClose});
  background-size: 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

const customStyles = {
  content: {
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    border: 'none',
    borderRadius: 'none',
    padding: '0px',
    boxSizing: 'border-box'
  }
};

class ScrubberModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      reference: refImage,
      test: testImage,
      diffImage
    } = this.props.scrubber.test;
    const { visible, mode, position } = this.props.scrubber;
    const {
      closeModal,
      showScrubberTestImage,
      showScrubberRefImage,
      showScrubber
    } = this.props;

    return (
      <Wrapper>
        <Modal
          isOpen={visible}
          /* onAfterOpen={this.afterOpenModal} */
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <ModalHeader>
            <Logo />
            <ButtonClose onClick={closeModal} />
          </ModalHeader>
          <ImageScrubber
            testImage={testImage}
            refImage={refImage}
            position={position}
            showButtons={diffImage && diffImage.length > 0}
            showScrubberTestImage={showScrubberTestImage}
            showScrubberRefImage={showScrubberRefImage}
            showScrubber={showScrubber}
          />
        </Modal>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    scrubber: state.scrubber
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeModal: () => {
      dispatch(closeModal(false));
    },
    showScrubberTestImage: val => {
      dispatch(showScrubberTestImage(val));
    },
    showScrubberRefImage: val => {
      dispatch(showScrubberRefImage(val));
    },
    showScrubber: val => {
      dispatch(showScrubber(val));
    }
  };
};

const ScrubberModalContainer = connect(mapStateToProps, mapDispatchToProps)(
  ScrubberModal
);

export default ScrubberModalContainer;
