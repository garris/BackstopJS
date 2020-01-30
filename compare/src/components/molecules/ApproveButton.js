import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { approveTest, filterTests } from '../../actions';
import { colors, fonts } from '../../styles';

const REMOTE_HOST = 'http://127.0.0.1';
const REMOTE_PORT = 3000;

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

const APPROVE_STATUS_TO_LABEL_MAP = {
  initial: 'Approve',
  pending: 'Pending...',
  approved: 'Approved',
  failed: 'Approve'
};

class ApproveButton extends React.Component {
  constructor (props) {
    super(props);
    this.approve = this.approve.bind(this);
    this.state = {
      approveStatus: 'initial',
      errorMsg: null
    };
  }

  approve () {
    const { fileName } = this.props;
    const url = `${REMOTE_HOST}:${REMOTE_PORT}/approve?filter=${fileName}`;
    this.setState({ approveStatus: 'pending' });

    fetch(url, {
      method: 'POST'
    })
      .then(response => {
        if (response.ok) {
          this.setState({ approveStatus: 'approved' });
          this.props.approveTest(this.props.currentId, this.props.filterStatus);
        } else {
          response.json().then(body => {
            this.setState({ approveStatus: 'failed', errorMsg: body.error });
          });
        }
      })
      .catch(err => {
        this.setState({ approveStatus: 'failed', errorMsg: `${err.message}. Please check your network.` });
      });
  }

  render () {
    const { approveStatus, errorMsg } = this.state;

    return (
      <div>
        <Button
          onClick={this.approve}
          disabled={approveStatus === 'approved'}
        >
          {APPROVE_STATUS_TO_LABEL_MAP[this.state.approveStatus]}
        </Button>
        {approveStatus === 'failed' && <ErrorMsg>BACKSTOP ERROR: {errorMsg}</ErrorMsg>}
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
