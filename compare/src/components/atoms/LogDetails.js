import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../styles';
import { connect } from 'react-redux';
import { openLogModal } from '../../actions';

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`;

const Value = styled.span`
  font-family: ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`;

const Link = styled.a`
  &::before {
    content: ${props => (props.withSeperator ? '"|"' : '')};
    margin: ${props => (props.withSeperator ? '0 10px' : '')};
  }
`;

export class LogDetails extends React.Component {
  onClick (log, event) {
    const { openLogModal } = this.props;
    event.preventDefault();
    openLogModal(log);
  }

  render () {
    const { referenceLog, testLog } = this.props;
    if (!referenceLog && !testLog) return [];
    return (
      <span>
        <Label>browser log: </Label>
        <Value>
        {
            testLog
              ? <Link href="#" onClick={ this.onClick.bind(this, testLog) } >
                  test
                </Link>
              : []
          }
          {
            referenceLog
              ? <Link withSeperator href="#" onClick={ this.onClick.bind(this, referenceLog) } >
                  reference
                </Link>
              : []
          }
        </Value>
      </span>
    );
  }
}

const mapStateToProps = state => {
  return {};
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
