const tests = (state = {}, action) => {
  switch (action.type) {
    case 'APPROVE_TEST':
      return Object.assign({}, state, {
        all: state.all.map(test => {
          if (test.pair && (test.pair.fileName === action.id)) {
            return Object.assign({}, test, { status: 'pass' });
          }
          return test;
        })
      });
    case 'FILTER_TESTS':
      if (action.status !== 'all') {
        return Object.assign({}, state, {
          filtered: state.all.filter(e => e.status === action.status),
          filterStatus: action.status
        });
      } else {
        return Object.assign({}, state, {
          filtered: state.all,
          filterStatus: action.status
        });
      }

    // @TODO: to optimize
    case 'SEARCH_TESTS':
      if (action.value.length > 0) {
        return Object.assign({}, state, {
          filtered: state.all.filter(e => {
            const fileName = e.pair.fileName.toLowerCase();
            const label = e.pair.label.toLowerCase();

            if (state.filterStatus !== 'all') {
              if (
                e.status === state.filterStatus &&
                (label.indexOf(action.value.toLowerCase()) !== -1 ||
                  fileName.indexOf(action.value.toLowerCase()) !== -1)
              ) {
                return true;
              }
            } else {
              if (
                label.indexOf(action.value.toLowerCase()) !== -1 ||
                fileName.indexOf(action.value.toLowerCase()) !== -1
              ) {
                return true;
              }
            }
            return false;
          })
        });
      }
      return state;

    default:
      return state;
  }
};

export default tests;
