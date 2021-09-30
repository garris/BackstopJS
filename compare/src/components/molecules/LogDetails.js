import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { openModal } from '../../actions';

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

  render () {
    const { referenceLog, testLog } = this.props.info;
    const { status } = this.props;

    if (typeof testLog !== 'object' && typeof referenceLog !== 'object') {
      return null;
    }

    return (
      <LogWrapper>
        {
          typeof referenceLog === 'object'
            ? <Wrapper><button>Reference Log</button></Wrapper>
            : <Wrapper></Wrapper>
        }
        {
          typeof testLog === 'object'
            ? <Wrapper><button>Test Log</button></Wrapper>
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
    openModal: value => {
      dispatch(openModal(value));
    }
  };
};

// eslint-disable-next-line no-unused-vars
const TestImagesContainer = connect(mapStateToProps, mapDispatchToProps)(
  LogDetails
);

export default LogDetails;
