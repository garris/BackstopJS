const tests = (state = {}, action) => {
  switch (action.type) {
    case 'FILTER_TESTS':
      if (action.status !== 'all') {
        return Object.assign({}, state, {
          filtered: state.all.filter(e => e.status === action.status),
          filterStatus: action.status
        })
      } else {
        return Object.assign({}, state, {
          filtered: state.all,
          filterStatus: action.status
        })
      }

    //@TODO: to optimize
    case 'SEARCH_TESTS':
      if (action.value.length > 0) {
        return Object.assign({}, state, {
          filtered: state.all.filter(e => {
            if (state.filterStatus !== 'all') {
              if (
                e.status === state.filterStatus &&
                e.pair.label
                  .toLowerCase()
                  .indexOf(action.value.toLowerCase()) !== -1
              )
                return true
            } else {
              if (
                e.pair.label
                  .toLowerCase()
                  .indexOf(action.value.toLowerCase()) !== -1
              )
                return true
            }
          })
        })
      }

    default:
      return state
  }
}

export default tests
