function getPosFromImgId(imgId) {
  switch (imgId) {
    case 'refImage':
      return 110;
    case 'testImage':
      return -10;
    default:
      return 50;
  }
}

const scrubber = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_SCRUBBER_MODAL':
      console.log('>>>', action);
      let targetImgId = '';
      try {
        targetImgId = action.value.targetImg.id;
      } catch (err) {}

      return Object.assign({}, state, {
        position: getPosFromImgId(targetImgId),
        visible: true,
        test: action.value
      });

    case 'CLOSE_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        visible: false,
        test: {}
      });

    case 'SHOW_SCRUBBER_TEST_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('testImage')
      });

    case 'SHOW_SCRUBBER_REF_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('refImage')
      });

    case 'SHOW_SCRUBBER':
      return Object.assign({}, state, {
        position: getPosFromImgId()
      });

    default:
      return state;
  }
};

export default scrubber;
