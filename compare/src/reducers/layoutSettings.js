const visibilityFilter = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return Object.assign({}, state, {
        [action.id]: !state[action.id]
      })
    default:
      return state
  }
}

export default visibilityFilter
