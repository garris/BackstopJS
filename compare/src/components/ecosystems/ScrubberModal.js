import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Modal from 'react-modal'
import { closeModal } from '../../actions'

// styles & icons
import { colors, fonts, shadows } from '../../styles'
import iconClose from '../../assets/icons/close.png'

// atoms
import Logo from '../atoms/Logo'
import TextDetails from '../atoms/TextDetails'
import ImageScrubber from '../atoms/ImageScrubber'

const Wrapper = styled.div`
  display: block;
`

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
`

const customStyles = {
  content: {
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    border: 'none',
    borderRadius: 'none',
    padding: '25px 60px',
    boxSizing: 'border-box'
  }
}

class ScrubberModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { reference: refImage, test: testImage } = this.props.scrubber.test
    let { visible } = this.props.scrubber

    return (
      <Wrapper>
        <Modal
          isOpen={visible}
          /* onAfterOpen={this.afterOpenModal} */
          onRequestClose={this.props.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <ButtonClose onClick={this.props.closeModal} />
          <Logo />
          {/* <div style={{ paddingTop: '20px', paddingLeft: '5px' }}>
            <TextDetails {...this.props} />
          </div> */}

          <ImageScrubber testImage={testImage} refImage={refImage} />
        </Modal>
      </Wrapper>
    )
  }
}

const mapStateToProps = state => {
  return {
    scrubber: state.scrubber
  }
}

const mapDispatchToProps = dispatch => {
  return {
    closeModal: () => {
      dispatch(closeModal(false))
    }
  }
}

const ScrubberModalContainer = connect(mapStateToProps, mapDispatchToProps)(
  ScrubberModal
)

export default ScrubberModalContainer
