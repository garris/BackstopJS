function getPosFromImgId (imgId) {
  switch (imgId) {
    case 'refImage':
      return 100;
    case 'testImage':
      return 0;
    case 'diffImage':
      return -1;
    default:
      return 50;
  }
}

function getModeFromImgId (imgId) {
  switch (imgId) {
    case 'refImage':
      return 'SHOW_SCRUBBER_REF_IMAGE';
    case 'testImage':
      return 'SHOW_SCRUBBER_TEST_IMAGE';
    case 'diffImage':
      return 'SHOW_SCRUBBER_DIFF_IMAGE'
    default:
      return 'SCRUB'
  }
}

const scrubber = (state = {}, action) => {
  switch (action.type) {
    case 'OPEN_SCRUBBER_MODAL':
      let targetImgId = '';
      try {
        targetImgId = action.value.targetImg.id;
      } catch (err) {}

      let scrubberModalMode = '';
      try {
        scrubberModalMode = action.value.targetImg.id;
      } catch (err) {}

      return Object.assign({}, state, {
        position: getPosFromImgId(targetImgId),
        visible: true,
        test: action.value,
        testImageType: targetImgId,
        scrubberModalMode: getModeFromImgId(targetImgId)
      });

    case 'CLOSE_SCRUBBER_MODAL':
      return Object.assign({}, state, {
        visible: false,
        test: {}
      });

    case 'SHOW_SCRUBBER_TEST_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('testImage'),
        scrubberModalMode: action.type,
        testImageType: 'testImage'
      });

    case 'SHOW_SCRUBBER_REF_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('refImage'),
        scrubberModalMode: action.type
      });

    case 'SHOW_SCRUBBER_DIFF_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('diffImage'),
        scrubberModalMode: action.type,
        testImageType: 'diffImage'
      });

    case 'SHOW_SCRUBBER_DIVERGED_IMAGE':
      return Object.assign({}, state, {
        position: getPosFromImgId('diffImage'),
        scrubberModalMode: action.type,
        testImageType: 'diffImage'
      });

    case 'SHOW_SCRUBBER':
      return Object.assign({}, state, {
        position: getPosFromImgId(),
        scrubberModalMode: 'SCRUB'
      });

    default:
      return state;
  }
};

export default scrubber;
