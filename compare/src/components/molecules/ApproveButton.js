import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { approveTest, filterTests } from '../../actions';
import { colors, fonts } from '../../styles';

const REMOTE_HOST = 'http://127.0.0.1';
const REMOTE_PORT = 3000;
const APPROVE_STATUS_TO_LABEL_MAP = Object.freeze({
  INITIAL: 'Approve',
  PENDING: 'Pending...',
  APPROVED: 'Approved',
  FAILED: 'Approve'
});

const Button = styled.button`
  font-size: 20px;
  line-height: 40px;
  font-family: ${fonts.latoRegular};
  background-color: ${colors.green};
  border: none;
  border-radius: 3px;
  color: ${colors.white};
  padding: 0px 30px;
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }

  &:disabled {
    background-color: ${colors.bodyColor};
    color: ${colors.secondaryText};
    cursor: default;
  }
`;

const ErrorMsg = styled.p`
  word-wrap: break-word;
  font-family: monospace;
  background: rgb(251, 234, 234);
  padding: 2ex;
  color: brown;
`;

class ApproveButton extends React.Component {
  constructor (props) {
    super(props);
    this.approve = this.approve.bind(this);
    this.state = {
      approveStatus: 'INITIAL',
      errorMsg: null
    };
  }

  async approve () {
    const { fileName } = this.props;
    const url = `${REMOTE_HOST}:${REMOTE_PORT}/approve?filter=${fileName}`;
    this.setState({ approveStatus: 'PENDING' });

    try {
      const response = await fetch(url, {
        method: 'POST'
      });

      if (response.ok) {
        this.setState({ approveStatus: 'APPROVED' });
        this.props.approveTest(this.props.currentId, this.props.filterStatus);
      } else {
        const body = await response.json();
        this.setState({ approveStatus: 'FAILED', errorMsg: body.error });
      }
    } catch (err) {
      this.setState({
        approveStatus: 'FAILED',
        errorMsg: `${err.message}. Please check your network.`
      });
    }
  }

  render () {
    const { approveStatus, errorMsg } = this.state;

    return (
      <div>
        <Button onClick={this.approve} disabled={approveStatus === 'APPROVED'}>
          {APPROVE_STATUS_TO_LABEL_MAP[this.state.approveStatus]}
        </Button>
        {approveStatus === 'FAILED' && (
          <ErrorMsg>BACKSTOP ERROR: {errorMsg}</ErrorMsg>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    filterStatus: state.tests.filterStatus
  };
};

const mapDispatchToProps = dispatch => {
  return {
    approveTest: (id, filterStatus) => {
      dispatch(approveTest(id));
      dispatch(filterTests(filterStatus));
    }
  };
};

const ApproveButtonContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ApproveButton);
export default ApproveButtonContainer;
