import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import Modal from 'react-modal'
import { closeModal, toggleScrubberMode } from '../../actions'

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
  top: 35px;
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
`

const ButtonToggleView = styled.button`
  display: block;
  margin: 0 auto;
  border: none;
  border-radius: 3px;
  background-color: ${colors.lightGray};
  text-align: center;
  padding: 12px 40px;
  color: ${colors.secondaryText};
  font-size: 16px;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: none;
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
    const { reference: refImage, test: testImage } = this.props.scrubber.test
    const { visible, mode } = this.props.scrubber
    const { closeModal, handleButtonMode } = this.props

    return (
      <Wrapper>
        <Modal
          isOpen={visible}
          /* onAfterOpen={this.afterOpenModal} */
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <ButtonClose onClick={closeModal} />
          <Logo />
          <ButtonToggleView onClick={handleButtonMode}>
            DIFF / SCRUB
          </ButtonToggleView>
          {/* <div style={{ paddingTop: '20px', paddingLeft: '5px' }}>
            <TextDetails {...this.props} />
          </div> */}
          {mode === 'scrub' && (
            <ImageScrubber testImage={testImage} refImage={refImage} />
          )}
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
    },
    handleButtonMode: mode => {
      dispatch(toggleScrubberMode(mode))
    }
  }
}

const ScrubberModalContainer = connect(mapStateToProps, mapDispatchToProps)(
  ScrubberModal
)

export default ScrubberModalContainer
