import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux'

// organisms
import TestCard from '../organisms/TestCard';

const ListWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
  margin-top: 20px;
  z-index: 1;
`;

class List extends React.Component {

  render () {
    let { tests } = this.props;

    return (
      <ListWrapper>
        {tests.map((test, i) =>
          <TestCard test={test} key={i}/>
        )}
      </ListWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests.filtered
  }
};

const ListContainer = connect(mapStateToProps)(List);

export default ListContainer
