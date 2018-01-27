const scrubber = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        position: 80,
        visible: true,
        test: action.value
      })

    case 'CLOSE_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        visible: false,
        test: {}
      })

    case 'TOGGLE_SCRUBBER_MODE':
      return Object.assign({}, state, {
        mode: state.mode === 'scrub' ? 'diff' : 'scrub'
      })

    case 'SHOW_SCRUBBER_TEST_IMAGE':
      return Object.assign({}, state, {
        position: 20
      })

    default:
      return state
  }
}

export default scrubber
