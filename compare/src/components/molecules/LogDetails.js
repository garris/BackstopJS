import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { openLogModal } from '../../actions';

const LogWrapper = styled.div`
  position: relative;
  display: flex;
`;

const Wrapper = styled.div`
  flex: 1 1 auto;
  padding: 0 25px;
  padding-top: ${props => (props.withText ? '10px' : '20px')};
  text-align: center;
`;

class LogDetails extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
    };
  }

  onClick (log) {
    const { openLogModal } = this.props;
    openLogModal(log);
  }

  render () {
    const { referenceLog, testLog } = this.props.info;
    const { status } = this.props;

    if (!testLog && !referenceLog) {
      return null;
    }

    return (
      <LogWrapper>
        {
          referenceLog
            ? <Wrapper><button
              onClick={ this.onClick.bind(this, referenceLog) }
            >Reference Log</button></Wrapper>
            : <Wrapper></Wrapper>
        }
        {
          testLog
            ? <Wrapper><button
              onClick={ this.onClick.bind(this, testLog) }
            >Test Log</button></Wrapper>
            : <Wrapper></Wrapper>
        }
        {(status !== 'pass') &&
          <Wrapper></Wrapper>
        }
      </LogWrapper>
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
    openLogModal: value => {
      dispatch(openLogModal(value));
    }
  };
};

const LogDetailsContainer = connect(mapStateToProps, mapDispatchToProps)(
  LogDetails
);

export default LogDetailsContainer;
