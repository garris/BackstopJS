const scrubber = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        visible: true,
        test: action.value
      })

    case 'CLOSE_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        visible: false,
        test: {}
      })

    default:
      return state
  }
}

export default scrubber
