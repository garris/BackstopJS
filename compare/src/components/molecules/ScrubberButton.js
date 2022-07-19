import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { openModal } from '../../actions';

// styles & icons
import { colors, fonts } from '../../styles';

const Wrapper = styled.div`
  display: block;
`;

const ButtonSD = styled.button`
  position: absolute;
  top: 15px;
  right: ${props => (props.onlyText ? '10px' : '115px')};
  padding: 10px 20px;
  background-color: ${colors.lightGray};
  color: ${colors.secondaryText};
  border-radius: 3px;
  text-transform: uppercase;
  font-family: ${fonts.latoRegular};
  text-align: center;
  font-size: 12px;
  border: none;

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }

  @media print {
    display: none;
  }
`;

class ScrubberButton extends React.Component {
  onClick () {
    const { openModal } = this.props;
    openModal(this.props.info);
  }

  render () {
    return (
      <Wrapper>
        <ButtonSD
          onClick={this.onClick.bind(this)}
          onlyText={this.props.onlyText}
        >
          SHOW DIFFS
        </ButtonSD>
      </Wrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    scrubber: state.scrubber
  };
};

const mapDispatchToProps = dispatch => {
  return {
    openModal: value => {
      dispatch(openModal(value));
    }
  };
};

const ScrubberButtonContainer = connect(mapStateToProps, mapDispatchToProps)(
  ScrubberButton
);

export default ScrubberButtonContainer;
