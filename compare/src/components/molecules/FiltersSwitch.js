import React from 'react';
import { connect } from 'react-redux'
import styled from 'styled-components';
import { filterTests } from '../../actions'

import ButtonFilter from '../atoms/ButtonFilter';

import { colors, fonts } from '../../styles';

const ButtonsWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
`;

function ButtonsFilter(props) {
  const availableStatus = props.availableStatus;

  const ListButton = availableStatus.map(status =>
    <ButtonFilter status={status.id} key={status.id} label={status.label} selected={props.filterStatus === status.id ? true : false} count={status.count} onClick={() => props.onClick(status.id)}/>
  );

  return (
    // change this with React16
    <div>{ListButton}</div>
  );
}

class FiltersSwitch extends React.Component {

  constructor(props) {
    super(props);

  }

  render () {
    let tests = this.props.tests;
    let availableStatus = this.props.availableStatus;


    return (
      <ButtonsWrapper>
        <ButtonsFilter availableStatus={availableStatus} onClick={this.props.onButtonClick} filterStatus={tests.filterStatus}/>
      </ButtonsWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests,
    availableStatus: state.availableStatus
  }
};

const mapDispatchToProps = dispatch => {
  return {
    onButtonClick: status => {
      dispatch(filterTests(status))
    }
  }
}

const FiltersSwitchContainer = connect(mapStateToProps, mapDispatchToProps)(FiltersSwitch);

export default FiltersSwitchContainer
