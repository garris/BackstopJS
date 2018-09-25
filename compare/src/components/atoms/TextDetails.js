import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import DiffDetails from './DiffDetails';
import UrlDetails from './UrlDetails';

import { colors, fonts } from '../../styles';

// styled
const WrapperDetails = styled.div``;

const Row = styled.div`
  padding: 5px 0;
`;

const Label = styled.span`
  font-family: ${fonts.latoRegular};
  color: ${colors.secondaryText};
  font-size: 14px;
  padding-right: 8px;
`;

const Value = styled.span`
  font-family ${fonts.latoBold};
  color: ${colors.primaryText};
  font-size: 14px;
  padding-right: 20px;
`;

const DetailsPanel = styled.div`
  display: ${props => (props.showPanel ? 'block' : 'none')};
  position: absolute;
  background-color: ${colors.white};
  padding: 10px;
  top: -28px;
  left: 20px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  z-index: 999;
`;

class TextDetails extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      showPanel: false
    };

    this.showPanel = this.showPanel.bind(this);
    this.hidePanel = this.hidePanel.bind(this);
  }

  showPanel () {
    const { settings } = this.props;
    if (!settings.textInfo) {
      this.setState({
        showPanel: true
      });
    }
  }

  hidePanel () {
    this.setState({
      showPanel: false
    });
  }

  render () {
    const {
      label,
      fileName,
      selector,
      diff,
      url,
      referenceUrl
    } = this.props.info;
    const { settings } = this.props;
    const { showPanel } = this.state;

    return (
      <WrapperDetails>
        <Row hidden={!settings.textInfo}>
          <Label>label: </Label>
          <Value>{label}</Value>
          <Label>selector: </Label>
          <Value>{selector}</Value>
        </Row>
        <Row>
          <Label>filename: </Label>
          <Value onMouseOver={this.showPanel}>{fileName}</Value>
        </Row>
        <DiffDetails suppress={!settings.textInfo} diff={diff} />

        <DetailsPanel {...{ showPanel }} onMouseLeave={this.hidePanel}>
          <Row>
            <Label>label: </Label>
            <Value>{label} </Value>
            <Label>selector: </Label>
            <Value>{selector} </Value>
          </Row>
          <Row>
            <Label>filename: </Label>
            <Value>{fileName} </Value>
          </Row>
          <Row>
            <UrlDetails url={url} referenceUrl={referenceUrl} />
            <DiffDetails diff={diff} />
          </Row>
        </DetailsPanel>
      </WrapperDetails>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.layoutSettings
  };
};

const TextDetailsContainer = connect(mapStateToProps)(TextDetails);

export default TextDetailsContainer;
