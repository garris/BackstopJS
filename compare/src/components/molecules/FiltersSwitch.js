import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { filterTests } from '../../actions';

import ButtonFilter from '../atoms/ButtonFilter';

const ButtonsWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  height: 100%;
`;

function ButtonsFilter (props) {
  const availableStatus = props.availableStatus;

  const ListButton = availableStatus.map(status => (
    <ButtonFilter
      status={status.id}
      key={status.id}
      label={status.label}
      selected={props.filterStatus === status.id}
      count={status.count}
      onClick={() => props.onClick(status.id)}
    />
  ));

  return (
    // change this with React16
    <div style={{ height: '100%' }}>{ListButton}</div>
  );
}

class FiltersSwitch extends React.Component {
  render () {
    const tests = this.props.tests;
    const availableStatus = [
      {
        id: 'all',
        label: 'all',
        count: tests.all.length
      },
      {
        id: 'pass',
        label: 'passed',
        count: tests.all.filter(e => e.status === 'pass').length
      },
      {
        id: 'fail',
        label: 'failed',
        count: tests.all.filter(e => e.status === 'fail').length
      }
    ];

    return (
      <ButtonsWrapper>
        <ButtonsFilter
          availableStatus={availableStatus}
          onClick={this.props.onButtonClick}
          filterStatus={tests.filterStatus}
        />
      </ButtonsWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onButtonClick: status => {
      dispatch(filterTests(status));
    }
  };
};

const FiltersSwitchContainer = connect(mapStateToProps, mapDispatchToProps)(
  FiltersSwitch
);

export default FiltersSwitchContainer;
