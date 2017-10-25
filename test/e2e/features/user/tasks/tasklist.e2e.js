import TaskList from './tasklist.page.js';

(function() {

  'use strict';

  describe('tasklist custom page', function() {

      var tasklist;

      beforeEach(() => {
        tasklist = TaskList.get();
      });

      afterEach(function() {
          browser.executeScript('window.localStorage.clear();');
          browser.manage().deleteAllCookies();
      });

      it('should load a list of task', function() {
          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(26);
      });

      it('should have a selected element by default', function() {
          var task = element(by.css('.Line.info'));
          expect(task).toBeDefined();
      });

      it('should search an element', function() {
          element(by.id('search')).sendKeys('app');
          element(by.id('search')).sendKeys(protractor.Key.ENTER);

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(2);

      });

      it('should change pagination', function() {
          element(by.css('.bo-Settings')).click();
          var test = element.all(by.css('.bo-TableSettings-content .btn-group button')).first().getText();
          element.all(by.css('.bo-TableSettings-content .btn-group button')).first().click();

          var tasks;
          tasklist.getTasks()
              .then(_tasks => tasks = _tasks)
              .then(() => test)
              .then(val => expect(tasks.length).toEqual(parseInt(val, 10)));
      });

      it('should go to filtered task by case id', function() {
          tasklist = TaskList.get({ case: 6 });
          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(2);
      });

      it('should filter task by case id', function() {
          element(by.css('#case')).sendKeys('6').sendKeys(protractor.Key.ENTER);

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(2);
      });

      it('should filter task by process', function() {
          element(by.css('.Filter-process .btn')).click();

          var processes = element.all(by.repeater('p in app.processes'));
          // 2 process + All
          expect(processes.count()).toEqual(3);

          //select last process
          processes.last().element(by.css('.processOptionLink')).click();
          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(2);
      });

      it('should have a selected list item', function() {
          var activeFilter = element(by.css('.TaskFilters .active'));
          expect(activeFilter.isPresent()).toBe(true);

      });

      it('should filter my tasks', function() {
          // select My task
          element.all(by.css('.TaskFilters li a')).get(1).click();

          var link = element(by.css('.TaskFilters .active'))
              .getWebElement()
              .getText();

          expect(link).toMatch(/my tasks/i);

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(2);
      });

      it('should set filter to done', function() {
          tasklist = TaskList.get({filter: 'done'});
          var link = element(by.css('.TaskFilters .active'))
              .getWebElement()
              .getText();
          expect(link).toMatch(/done/i);

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(5);
      });

      it('should filter done tasks', function() {
          element.all(by.css('.TaskFilters li a')).get(2).click();

          var link = element(by.css('.TaskFilters .active'))
              .getWebElement()
              .getText();
          expect(link).toMatch(/done/i);

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(5);
      });

      it('should have sorted tasks by default', function() {
          var tasks = tasklist.getTasks();
          tasks.first().all(by.css('td')).get(2).getText().then(function(name) {
              expect(name.trim()).toBe('A Étape1');
          });
      });

      it('should have sort tasks DESC when click on active sort button', function() {
          var sortButtons = element(by.css('.bo-SortButton--active'));
          //Click on the first button
          sortButtons.click();

          var task = element.all(by.css('.Line td:first-child+td+td')).first();

          task.getText().then(function(name) {
              expect(name.trim()).toBe('Z Contract Mail');
          });
      });

      it('should update tasks when navigate using pagination', function() {
          // open table settings
          element.all(by.css('.bo-Settings')).first().click();
          //Select pagination 25
          element.all(by.css('.bo-TableSettings-content .btn-group button')).first().click();

          // Go to last page
          element
              .all(by.repeater('page in pages track by $index'))
              .last()
              .element(by.tagName('a'))
              .click();

          var tasks = tasklist.getTasks();
          expect(tasks.count()).toBe(1);
      });


      it('should toggle tasks filters menu when click toggle filters', function() {
          var toggleMenu = element(by.css('.FilterToggle'));
          var taskList = element(by.css('.TaskList'));
          var originalWidth = 0;

          taskList.getSize()
              .then(function(size) {
                  originalWidth = size.width;
                  toggleMenu.click();
                  return taskList.getSize();
              })
              .then(function(size) {
                  expect(size.width).toBeGreaterThan(originalWidth);
                  toggleMenu.click();
                  return taskList.getSize();
              })
              .then(function(size) {
                  expect(size.width).toBe(originalWidth);
              });
      });

    it('should save display mode in local storage', function() {
      expect(tasklist.detailsPanel().isCollapsed()).toBeFalsy();
      expect(element(by.css('.TaskFilters')).isDisplayed()).toBeTruthy();          // filter panel

      tasklist.detailsPanel().collapse();
      element(by.css('.FilterToggle')).click();
      browser.refresh();

      expect(tasklist.detailsPanel().isCollapsed()).toBeTruthy();
      expect(element(by.css('.TaskFilters')).isDisplayed()).toBeFalsy();
    });

      it('should toggle Details view menu when click expand', function() {
          var taskList = element(by.css('.TaskList')), originalWidth = 0;

          taskList.getSize()
              .then(function(size) {
                  originalWidth = size.width;
                  tasklist.detailsPanel().collapse();
                  return taskList.getSize();
              })
              .then(function(size) {
                  expect(size.width).toBeGreaterThan(originalWidth);
                  tasklist.detailsPanel().expand();
                  return taskList.getSize();
              })
              .then(function(size) {
                  expect(size.width).toBe(originalWidth);
              });
      });


      it('selectAll should select all task', function() {
          element.all(by.css('th .Cell-ckeckbox input[type=checkbox]')).click();

          var cb = element.all(by.css('.Line input[type=checkbox]'));
          expect(cb.count()).toBe(26);
      });

      it('should be localized', function() {
        browser.manage().addCookie({name:'BOS_Locale', value:'fr'});
        browser.refresh();

        expect(element(by.css('.TaskFilters #todo-tasks')).getText()).toEqual('A faire');
        expect(element(by.css('#form-tab')).getText()).toEqual('Formulaire');
        expect(element(by.css('#btn-group-assigntome')).getText()).toMatch(/Prendre/i);
      });
  });
})();
