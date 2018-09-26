import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
// import { findTests } from '../../actions'

// atoms
import ButtonSettings from '../atoms/ButtonSettings';

// molecules
import SettingsPopup from './SettingsPopup';

const SettingsWrapper = styled.div`
  flex: 0 0 auto;
  height: 100%;
`;

class SettingsPanel extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      popup: false
    };
  }

  onButtonClick () {
    this.setState({
      popup: !this.state.popup
    });
  }

  render () {
    const popupVisible = this.state.popup;

    return (
      <SettingsWrapper>
        <ButtonSettings
          onClick={this.onButtonClick.bind(this)}
          active={this.state.popup}
        />
        {popupVisible && <SettingsPopup />}
      </SettingsWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    // onChange: value => {
    //   dispatch(findTests(value))
    // }
  };
};

const SettingsContainer = connect(mapStateToProps, mapDispatchToProps)(
  SettingsPanel
);

export default SettingsContainer;
