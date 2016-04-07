(function() {

  'use strict';

  angular
    .module('org.bonitasoft.features.user.tasks.details')
    .controller('TaskDetailsCtrl', TaskDetailsCtrl);

  function TaskDetailsCtrl($scope, iframe, taskListStore, taskDetailsHelper, processAPI, formMappingAPI, $state, $stateParams) {
    //Default inactive value to false
    $scope.inactive = $scope.inactive || false;

    // Watch the currentCase
    $scope.$watch('currentCase', function(newCase) {
      if (!newCase) {
        return;
      }

      $stateParams.case = newCase;
      $state.transitionTo($state.current, $stateParams, {
        inherit: false,
        notify: true
      });

      $scope.overviewUrl = iframe.getCaseOverview(newCase, newCase.processDefinitionId);
      $scope.diagramUrl = iframe.getCaseVisu(newCase, newCase.processDefinitionId);
    });

    $scope.hasForm = false;

    // Watch the currentTask
    $scope.$watch('currentTask', function(newTask) {
      if (!newTask) {
        return;
      }
      //Check if the task has a form
      if ('USER_TASK' === $scope.currentTask.type) {
        formMappingAPI.search({
          p: 0,
          c: 1,
          f: ['processDefinitionId=' + $scope.currentTask.processId, 'task=' + $scope.currentTask.name, 'type=TASK']
        }).$promise.then(function(response) {
            if (response.resource.pagination.total > 0 && response.resource[0].target === 'NONE') {
              $scope.hasForm = false;
            } else {
              $scope.hasForm = true;
              if (!$scope.hideForm) {
                /*jshint camelcase: false*/
                processAPI
                  .get({
                    id: $scope.currentTask.processId
                  })
                  .$promise.then(function(data) {
                    // Load the task informatioin for the iframe
                    $scope.formUrl = iframe.getTaskForm(data, $scope.currentTask, taskListStore.user.user_id, false);
                  });
              }
            }
          });
      }
    });

    /**
     * onSelectTab button handler
     * @return {[type]} [description]
     */
    $scope.onClickTab = function(tab) {
      taskDetailsHelper.saveSelectedTab(tab);
    };

    /**
     * onTaskTask button handler
     * @return {[type]} [description]
     */
    $scope.onTakeReleaseTask = function() {
      taskDetailsHelper
        .takeReleaseTask($scope.currentTask)
        .then(function() {
          $scope.refreshCount();
        });
    };
  }

})();