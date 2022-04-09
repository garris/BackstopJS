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
  constructor (props) {
    super(props);
    this.state = { logLines: null };
  }

  render () {
    const {
      visible
      // logs: logPath
    } = this.props.logs;

    const logLines = this.state.logLines;
    const loadedLogs = logLines && logLines.map(it => it[2]).join('\n');
    const logs = loadedLogs || 'Loading Logs...';

    return (
      <Wrapper>
        <Modal
          isOpen={visible}
          onAfterOpen={this.afterOpenModal.bind(this)}
          onRequestClose={this.clearAndCloseModal.bind(this)}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <ModalHeader>
            <Logo />
            <ButtonClose onClick={this.clearAndCloseModal.bind(this)} />
          </ModalHeader>
          <TextArea value={logs}></TextArea>
        </Modal>
      </Wrapper>
    );
  }

  clearAndCloseModal () {
    const {
      closeModal
    } = this.props;

    this.setState({
      logLines: null
    });
    closeModal();
  }

  afterOpenModal () {
    const logPath = this.props.logs.logs;
    fetch(logPath).then(async (response) => {
      if (response.ok) {
        const json = await response.json();
        this.setState({
          logLines: json
        });
      } else {
        this.setState({ logLines: [['', '', `error fetching logs: ${response.statusText}`]] });
      }
    }).catch(err => {
      const errorLines = [['', '', `error fetching logs: ${err.message}`]];
      if (location.protocol.startsWith('file')) {
        errorLines.push(['', '', 'This feature requires Backstop Remote running in a seprate terminal window.']);
        errorLines.push(['', '', 'e.g. `backstop remote --config=<your config>`']);
        errorLines.push(['', '', 'Please see the docs for more info.']);
      }
      this.setState({ logLines: errorLines });
    });
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
