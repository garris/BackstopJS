'use strict';
const noop = function (){};
let LCS_DIFF_ARRAY_METHOD = undefined;
// debugger
if (typeof require !== 'undefined') {
    LCS_DIFF_ARRAY_METHOD = require('diff').diffArrays;
} else {
    try {
        LCS_DIFF_ARRAY_METHOD = JsDiff.diffArrays;
    } catch(err) {
        console.error(err);
    }
}

const spread = 50; // range of adjacent pixels to aggregate when calculating diff
const IS_ADDED_WORD = '0_255_0_255';
const IS_REMOVED_WORD = '255_0_0_255';
const IS_ADDED_AND_REMOVED_WORD = '0_255_255_255';
const IS_SAME_WORD = '';
const OPACITY = '30'; // 0-255 range

/**
 * Applies meyers-diff algorithm to imageData formatted arrays
 * 
 * @param {Uint8ClampedArray} [reference] baseline image
 * @param {Uint8ClampedArray} [test] test image
 * 
 * @returns {Uint8ClampedArray} diff image
 * 
 */
if (typeof module !== 'undefined') {
    module.exports = diverged;
}

function diverged(reference, test, h, w) {
    console.time("diverged_total_time");

    const spread = Math.floor(h / 80); //override

    console.log('spread:', spread);

    console.time("imgDataToWords");
    const img1wordArr = imgDataToWords(reference);
    const img2wordArr = imgDataToWords(test);
    console.timeEnd("imgDataToWords");

    console.time("imgDataWordArrToColsAndRows");
    let cols_rows_ref = imgDataWordArrToColsAndRows(img1wordArr, h, w);
    let cols_rows_test = imgDataWordArrToColsAndRows(img2wordArr, h, w);
    console.timeEnd("imgDataWordArrToColsAndRows");

    console.time("groupAdjacent");
    const columnRef = groupAdjacent(cols_rows_ref.columns, spread, h, w);
    const columnTest = groupAdjacent(cols_rows_test.columns, spread, h, w);
    console.timeEnd("groupAdjacent");

    console.time("columnDiffRaw");
    const columnDiffRaw = diffArr(columnRef, columnTest, h, w);
    console.timeEnd("columnDiffRaw");

    console.time("reduceColumnDiffRaw");
    const reducedColumnDiff = reduceColumnDiffRaw(columnDiffRaw, h, w);
    console.timeEnd("reduceColumnDiffRaw");
    // console.log("reducedColumnDiff>>>", reducedColumnDiff);
    
    console.time("unGroupAdjacent");
    const expandedColumns = ungroupAdjacent(reducedColumnDiff, spread, cols_rows_test.columns, h, w);
    console.timeEnd("unGroupAdjacent");

    console.time("columnWordDataToImgDataFormatAsWords");
    const convertedColumnDiffImgData = columnWordDataToImgDataFormatAsWords(expandedColumns, h, w);
    console.timeEnd("columnWordDataToImgDataFormatAsWords");
    // console.log("convertedColumnDiffImgData>>>", convertedColumnDiffImgData);

    console.time("imgDataWordsToClampedImgData");
    const imgDataArr = convertImgDataWordsToClampedImgData(convertedColumnDiffImgData);
    console.timeEnd("imgDataWordsToClampedImgData");
    // console.log("imgDataArr>>>", imgDataArr);

    console.timeEnd("diverged_total_time");
    return imgDataArr;
}

/**
 * ========= HELPERS ========
 */

function columnWordDataToImgDataFormatAsWords(columns, h, w) {
    const imgDataWordsLength = w * h;

    let convertedArr = new Array(imgDataWordsLength);
    for (var i = 0; i < imgDataWordsLength; i++) {
        const {column, depth} = serialToColumnMap(i, h, w);
        convertedArr[i] = columns[column][depth];
    }
    return convertedArr;
}

function convertImgDataWordsToClampedImgData(wordsArr) {
    let convertedArr = new Uint8ClampedArray(wordsArr.length * 4);
    for (var i = 0; i < wordsArr.length; i++) {
        const convertedOffset = i * 4;
        const segments = wordsArr[i].split('_');
        convertedArr[convertedOffset] = segments[0];
        convertedArr[convertedOffset+1] = segments[1];
        convertedArr[convertedOffset+2] = segments[2];
        convertedArr[convertedOffset+3] = segments[3];
    }
    return convertedArr;
}

function reduceColumnDiffRaw(columnDiffs, h, w) {
    let reducedColumns = new Array(columnDiffs.length);
    for (let columnIndex = 0; columnIndex < columnDiffs.length; columnIndex++) {
        const columnDiff = columnDiffs[columnIndex];
        let resultColumn = new Array();
        let removedCounter = 0;
        let resultClass = '';
        let segment = [];
        let debug = false;

        for (let depthIndex = 0; depthIndex < columnDiff.length; depthIndex++) {
            let segmentLength = 0;

            if (columnDiff[depthIndex].removed) {
                segmentLength = columnDiff[depthIndex].count;
                removedCounter += segmentLength;
                resultClass = IS_REMOVED_WORD;
            } else {
                if (columnDiff[depthIndex].added) {
                    if (removedCounter) {
                        resultClass = IS_ADDED_AND_REMOVED_WORD;
                    } else {
                        resultClass = IS_ADDED_WORD;
                    }
                } else {
                    resultClass = IS_SAME_WORD;
                }


                segmentLength = columnDiff[depthIndex].count;

                if (removedCounter > 0) {
                    if (segmentLength > removedCounter) {
                        segmentLength -= removedCounter;
                        removedCounter = 0;
                    } else {
                        removedCounter -= segmentLength;
                        segmentLength = 0;
                    }
                }
            }

            if (!segmentLength) {
                continue;
            } else {
                segmentLength = Math.min(segmentLength, h - resultColumn.length);
            }

            const printSampleMap = false;
            if (!printSampleMap || resultClass !== IS_SAME_WORD){
                segment = new Array(segmentLength).fill(resultClass);
            } else {
                // reduced resolution image
                segment = columnDiff[depthIndex].value.slice(0,segmentLength).map((value, i) => {
                    if (/|/.test(value)) {
                        return value.split('|')[0];
                    }
                    return value;
                });
            }


            resultColumn = resultColumn.concat(segment);
            
            if (resultColumn.length > h) {
                console.log('WARNING -- this value is out of bounds!')
            }
        }
        
        reducedColumns[columnIndex] = resultColumn;
    }

    return reducedColumns;
}

function diffArr(refArr, testArr, h, w) {
    let rawResultArr = [];
    for (let i = 0; i < refArr.length; i++) {
        rawResultArr.push(LCS_DIFF_ARRAY_METHOD(refArr[i], testArr[i]));
    }
    return rawResultArr;
}

function groupAdjacent(columns, spread, h, w) {
    if (!spread) {
        return columns;
    }
    
    /**
     * [getAdjacentArrayBounds retuns existing adjacent lower and upper column bounds]
     * @param  {[int]} pointer [current index]
     * @param  {[int]} spread  [distance from index]
     * @param  {[int]} length     [total length]
     * @return {[array]}         [0] lower bound, [1] upper bound
     */
    function getAdjacentArrayBounds(pointer, spread, length) {
        return [
            // Math.max(0, pointer - spread),
            Math.max(0, pointer),
            Math.min(length - 1, pointer + spread)
        ]
    }

    function getInterpolatedSequence(beginning, end) {
        const interpolated = [];
        for (let step = beginning; step <= end; step++) {
            interpolated.push(step);
        }
        return interpolated;
    }

    function getCompositeColumnDepthValues(columns, range, depth) {
        return range.reduce((acc, column) => {
            return acc.concat(columns[column][depth]);
        }, [])
    }

    const interpolatedColumnsValues = new Array();
    let i = 0;
    while (i < w) {
        const adjacentBounds = getAdjacentArrayBounds(i, spread, w);
        const interpolatedColumns = getInterpolatedSequence(...adjacentBounds);
        
        const columnComposite = new Array(h);
        for (var depth = 0; depth < h; depth++) {        
            columnComposite[depth] = getCompositeColumnDepthValues(columns, interpolatedColumns, depth).join('|');
        }
        interpolatedColumnsValues.push(columnComposite);
        i += spread;
    }
    return interpolatedColumnsValues;
}

function ungroupAdjacent(grouped, spread, columnUnderlay, h, w) {
    if (!spread) {
        return grouped;
    }

    function mapUngroupedColumnIndexToGroupedIndex(index, spread) {
        return Math.floor(index / spread);
    }

    const ungrouped = new Array(w);
    for (let i = 0; i < w; i++) {
         if (!ungrouped[i]) {
            ungrouped[i] = new Array(h);
         }

         const groupedIndex = mapUngroupedColumnIndexToGroupedIndex(i, spread);
         for (let j = 0; j < h; j++) {
            const value = grouped[groupedIndex][j].split('|')[0];
            ungrouped[i][j] = value ? value : columnUnderlay[i][j].replace(/\d+$/, OPACITY);
         }
    }

    return ungrouped
}



function imgDataWordArrToColsAndRows(arr, h, w) {
    let columns = new Array(w);
    let rows = new Array(h);

    for (var i = 0; i < arr.length; i++) {
        const word = arr[i];

        var {column, depth} = serialToColumnMap(i, h, w);
        if (!columns[column]) {
            columns[column] = new Array(h);
        }
        columns[column][depth] = word;
        
        var {row, index} = serialToRowMap(i, h, w);
        if (!rows[row]) {
            rows[row] = new Array(w);
        }
        rows[row][index] = word;
    }
    return {columns, rows}
}

function serialToColumnMap(index, h, w) {
    return {
        column: index % w, 
        depth: Math.floor(index / w)
    }
}

function serialToRowMap(index, h, w) {
    return {
        row: Math.floor(index / w), 
        index: index % w
    }
}

function imgDataToWords(arr) {
    let result = [];
    for (let i = 0; i < arr.length-1; i += 4) {
        result.push(`${arr[i]}_${arr[i+1]}_${arr[i+2]}_${arr[i+3]}`)
    }
    return result;
}
