import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import DiffDetails from './DiffDetails';
import UrlDetails from './UrlDetails';

import { colors, fonts } from '../../styles';

// styled
const Row = styled.div`
  padding: 5px 0;
`;

const RowDefault = styled(Row)`
  display: block !important;
`;

const WrapperDetailsStatic = styled.div`
  ${Row} {
    display: ${props => (props.textInfo ? 'block' : 'none')};
  }
`;

const WrapperDetailsPopup = styled.div`
  position: absolute;
  background-color: ${colors.white};
  padding: 10px;
  top: -28px;
  left: 12px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  z-index: 999;

  ${Row} {
    display: block;
  }
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

const WrapperDetails = props => {
  const {
    children,
    hidePanel,
    showPanel,
    textInfo
  } = props;

  return showPanel && !textInfo
    ? <WrapperDetailsPopup onMouseLeave={hidePanel}>{children}</WrapperDetailsPopup>
    : <WrapperDetailsStatic textInfo={textInfo}>{children}</WrapperDetailsStatic>;
};

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
      referenceUrl,
      viewportLabel
    } = this.props.info;
    const { textInfo } = this.props.settings;
    const { showPanel } = this.state;
    const hidePanel = this.hidePanel;

    return (
      <WrapperDetails {...{ textInfo, showPanel, hidePanel }}>
        <Row>
          <Label>filename: </Label>
          <Value>{fileName}</Value>
        </Row>
        <RowDefault onMouseOver={this.showPanel}>
          <Label>label: </Label>
          <Value>{label}</Value>
          <Label>viewport: </Label>
          <Value>{viewportLabel}</Value>
        </RowDefault>
        <Row>
          <Label>selector: </Label>
          <Value>{selector}</Value>
        </Row>
        <Row>
          <UrlDetails url={url} referenceUrl={referenceUrl} />
          <DiffDetails diff={diff} />
        </Row>
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
