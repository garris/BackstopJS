const tests = (state = {}, action) => {
  switch (action.type) {
    case 'FILTER_TESTS':
      if(action.status !== 'all') {
        return Object.assign({}, state, {
          filtered: state.all.filter(e => e.status === action.status),
          filterStatus: action.status
        });
      } else {
        return Object.assign({}, state, {
          filtered: [],
          filterStatus: action.status
        });
      }
    default:
      return state
  }
}

export default tests
