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
  FAILED: 'Approve'
});

const Button = styled.button`
  font-size: 12px;
  line-height: auto;
  font-family: ${fonts.latoRegular};
  background-color: ${colors.borderGray};
  border: none;
  height: 32px;
  border-radius: 3px;
  color: ${colors.white};
  padding: 5px 5px;

  &:hover {
    cursor: pointer;
    background-color: ${colors.green};
  }

  &:disabled {
    background-color: ${colors.bodyColor};
    color: ${colors.secondaryText};
    cursor: default;
  }
`;

// const ErrorMsg = styled.div`
//   word-wrap: break-word;
//   font-family: monospace;
//   background: rgb(251, 234, 234);
//   color: brown;
//   line-height: 32px;
// `;

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
        this.setState({ approveStatus: 'INITIAL' });
        this.props.approveTest(fileName, this.props.filterStatus);
      } else {
        const body = await response.json();
        this.setState({ approveStatus: 'FAILED', errorMsg: body.error });
      }
    } catch (err) {
      this.setState({
        approveStatus: 'FAILED',
        errorMsg: `${err.message}. 🧐
Looks like the "approve" operation failed.
Please check that backstopRemote is running.
      `
      });
      alert(this.state.errorMsg);
    }
  }

  render () {
    const { approveStatus } = this.state;

    return (
      <div>
        <Button onClick={this.approve} disabled={approveStatus === 'APPROVED' || approveStatus === 'PENDING'}>
          {APPROVE_STATUS_TO_LABEL_MAP[this.state.approveStatus]}
        </Button>
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
