/* global angular */

var tests = {};

function report(report) {
  tests = report;
}

var compareApp = angular.module('compareApp', ['ui.bootstrap']);

var defaultMisMatchThreshold = 1;

var testPairObj = function (o) {
  this.a = {src: o.pair.reference || '', srcClass: 'reference'};
  this.b = {src: o.pair.test || '', srcClass: 'test'};
  this.c = {src: o.pair.diffImage || '', srcClass: 'diff'};

  this.report = JSON.stringify(o.pair.diff, null, 2);
  this.passed = o.status == "pass";
  this.meta = o;
  this.meta.misMatchThreshold = (o && o.misMatchThreshold && o.misMatchThreshold >= 0) ? o.misMatchThreshold : defaultMisMatchThreshold;
};

compareApp.controller('MainCtrl', function ($scope, $uibModal) {
  $scope.name = tests.testSuite;
  $scope.testPairs = [];
  $scope.passedCount = 0;
  $scope.testDuration = 0;
  $scope.testIsRunning = true;
  $scope.isSummaryListCollapsed = true;

  tests.tests.forEach(function (o) {
    $scope.testDuration += o.pair.diff.analysisTime;

    if (o.pair.diff.isSameDimensions) {
      delete o.pair.diff.dimensionDifference;
    }

    delete o.pair.diff.analysisTime;

    if (o.status == "pass") {
      $scope.passedCount++;
    }

    $scope.testPairs.push(new testPairObj(o));
  });

  $scope.statusFilter = 'failed';
  if ($scope.passedCount === $scope.testPairs.length) {
    $scope.statusFilter = 'passed';
  }

  $scope.detailFilterOptions = ['failed', 'passed', 'all', 'none'];

  $scope.displayOnStatusFilter = function (o) {
    if ($scope.statusFilter === 'all') {
      return true;
    }

    if ($scope.statusFilter === 'failed' && !o.passed) {
      return true;
    }

    if ($scope.statusFilter === 'passed' && o.passed) {
      return true;
    }

    return false;
  };

  $scope.openModal = function (size, referenceImg, testImg) {
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      windowClass: 'modal',
      resolve: {
        referenceImg: function () {
          return referenceImg;
        },
        testImg: function () {
          return testImg;
        },
      }
    });
  };
});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.
compareApp.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, referenceImg, testImg) {

  $scope.selected = {
    referenceImg: referenceImg,
    testImg: testImg
  };

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
