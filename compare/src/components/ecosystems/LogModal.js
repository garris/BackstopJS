import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Modal from 'react-modal';
import {
  closeLogModal
} from '../../actions';

// styles & icons
import iconClose from '../../assets/icons/close.png';

// atoms
import Logo from '../atoms/Logo';

const Wrapper = styled.div`
  display: block;
`;

const TextArea = styled.textarea`
display: block;
width: 90%;
height: 50%;
margin 0 auto;

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

class LogModal extends React.Component {
  render () {
    const {
      visible,
      logs: jsonLogs
    } = this.props.logs;
    const {
      closeModal
    } = this.props;

    const logs = jsonLogs && jsonLogs.map(it => it[2]).join('\n');

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
          <TextArea>{ logs }</TextArea>
        </Modal>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    logs: state.logs
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeModal: () => {
      dispatch(closeLogModal(false));
    }
  };
};

const ScrubberModalContainer = connect(mapStateToProps, mapDispatchToProps)(
  LogModal
);

export default ScrubberModalContainer;
