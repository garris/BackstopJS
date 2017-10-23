function toggleAll(obj, val) {
  let res = Object.assign({}, obj)

  for (let key in res) res[key] = val

  return res
}

const visibilityFilter = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return Object.assign({}, state, {
        [action.id]: !state[action.id]
      })

    case 'TOGGLE_ALL_IMAGES':
      return Object.assign({}, state, toggleAll(state, action.value))

    default:
      return state
  }
}

export default visibilityFilter
