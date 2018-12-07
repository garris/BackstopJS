const visibilityFilter = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return Object.assign({}, state, {
        [action.id]: !state[action.id]
      });

    case 'TOGGLE_ALL_IMAGES':
      return Object.assign({}, state, {
        refImage: action.value,
        testImage: action.value,
        diffImage: action.value
      });

    default:
      return state;
  }
};

export default visibilityFilter;
