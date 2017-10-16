import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux'

// organisms
import TestCard from '../organisms/TestCard';

const ListWrapper = styled.section`
  width: 100%;
  margin: 0 auto;
  margin-top: 50px;
`;

class List extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tests: (props.tests.filtered && props.tests.filtered.length > 0) ? props.tests.filtered : props.tests.all
    };
  }

  render () {
    let { tests } = this.props;
    this.state.tests = (tests.filtered && tests.filtered.length > 0) ? tests.filtered : tests.all;

    return (
      <ListWrapper>
        {this.state.tests.map((test, i) =>
          <TestCard test={test} key={i}/>
        )}
      </ListWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests
  }
};

const ListContainer = connect(mapStateToProps)(List);

export default ListContainer
