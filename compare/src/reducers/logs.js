const logs = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_LOG_MODAL':
      return Object.assign({}, state, {
        visible: true,
        logs: action.value
      });

    case 'CLOSE_LOG_MODAL':
      return Object.assign({}, state, {
        visible: false
      });
    default:
      return state;
  }
};

export default logs;
