import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

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
    const { tests, settings } = this.props;
    const onlyText =
      !settings.refImage && !settings.testImage && !settings.diffImage;

    return (
      <ListWrapper>
        {tests.map((test, i, arr) => (
          <TestCard
            id={`test${i}`}
            numId={i}
            test={test}
            key={i}
            lastId={arr.length - 1}
            onlyText={onlyText}
          />
        ))}
      </ListWrapper>
    );
  }
}

const mapStateToProps = state => {
  return {
    tests: state.tests.filtered,
    settings: state.layoutSettings
  };
};

const ListContainer = connect(mapStateToProps)(List);

export default ListContainer;
