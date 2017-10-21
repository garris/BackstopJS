import React from 'react';
// import { connect } from 'react-redux'
import styled from 'styled-components';
import Modal from 'react-modal';

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

const ButtonSD = styled.button`
  position: absolute;
  top: 15px;
  right: ${props => props.onlyText ? '10px' : '115px' };
  padding: 10px 20px;
  background-color: ${colors.lightGray};
  color: ${colors.secondaryText};
  border-radius: 3px;
  text-transform: uppercase;
  font-family: ${fonts.latoRegular};
  text-align: center;
  font-size: 12px;
  border: none;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }
`;

const ButtonClose = styled.button`
  position: absolute;
  right: 60px;
  top: 25px;
  width: 40px;
  height: 40px;
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
  content : {
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    border: 'none',
    borderRadius: 'none',
    padding: '25px 60px',
    boxSizing: 'border-box'
  }
};


class ScrubberModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  render () {
    let { reference: refImage, test: testImage } = this.props.info;

    return (
      <Wrapper>
        <ButtonSD onClick={this.openModal} onlyText={this.props.onlyText} >SHOW DIFFS</ButtonSD>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <ButtonClose onClick={this.closeModal} />
          <Logo />
          <div style={{paddingTop: '20px', paddingLeft: '5px'}}>
            <TextDetails {...this.props} />
          </div>

          {<ImageScrubber testImage={testImage} refImage={refImage} />}

        </Modal>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {

  }
};

const mapDispatchToProps = dispatch => {
  return {

  }
}

// const ScrubberModal = connect(mapStateToProps, mapDispatchToProps)(ScrubberModal);

export default ScrubberModal
