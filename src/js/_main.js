
var sfitTimerApp = angular.module(
    'sfitTimerApp',
    [
        'odoo',
        'ngCookies',
        'timer',
        'ui.bootstrap',
        'ngSanitize',
    ]
);

sfitTimerApp.controller('mainController', [
    '$scope', '$cookies', '$http', '$window', '$timeout', '$rootScope', '$location', 'jsonRpc',
    function ($scope, $cookies, $http, $window, $timeout, $rootScope, $location, jsonRpc, data) {

        $scope.limitRange = [
            {val:'5', opt: '5'},
            {val:'10', opt: '10'},
            {val:'15', opt: '15'},
            {val:'', opt: 'All'},
        ];

        //-----------------------------------
        /* MAIN CODE */
        storage.getItem("start_date_time", function (active_timer) {
            if (active_timer) {
                $scope.current_date = JSON.parse(active_timer);
                $scope.startTimeCount = JSON.parse(active_timer).start_time;
            } else {
                console.log('no active timer found');
            }
        });

        $scope.data = {};
        $scope.data.today = new Date();

        storage.getItem("host_info", function (host_info) {
            if (host_info) {
                var host_info = JSON.parse(host_info);
                $scope.data.host = host_info.host;
                $scope.data.database = host_info.database;
                jsonRpc.odoo_server = $scope.data.host;

                // Check if user is logged in and set user:
                jsonRpc.getSessionInfo().then(function (result) {
                    if (result.uid) {
                        $scope.set_current_user(result.uid);
                        $scope.database = result.db;
                    } else {
                        $scope.to_login();
                    }
                }, function() {
                    $scope.to_login();
                });
            } else {
                $scope.to_login();
            }
        });
        //-----------------------------------

        // LOGIN
        $scope.login = function () {
            jsonRpc.odoo_server = $scope.data.host;
            $scope.database = $scope.data.database;
            $scope.loginLoading = true;
            // Check if username and password exists
            if (!$scope.data.username || !$scope.data.password) {
                $scope.loginError = 'Username or Password is missing';
            } else {
                jsonRpc
                    .login($scope.data.database, $scope.data.username, $scope.data.password)
                    .then(function (response) {
                        var host_info = {
                            'host': $scope.data.host,
                            'database': $scope.data.database,
                        };
                        storage.setItem('host_info', JSON.stringify(host_info));
                        $scope.set_current_user(response.uid);
                        $scope.loginLoading = false;
                    }, function (response) {
                        $scope.loginError = response.message;
                    });
            }
        };

        $scope.to_main = function () {
            $("#wrapper").removeClass("hide");
            $("#loader-container").addClass("hide");
            $("#login").addClass("hide");
        };

        $scope.to_login = function () {
            $("#login").removeClass("hide");
            $("#loader-container").addClass("hide");
            $("#wrapper").addClass("hide");
        };

        $scope.logout = function () {
            jsonRpc.logout();
            // Delete odoo cookie.
            $cookies.remove('session_id');
            $scope.data.user = null;
            $scope.to_login();
            console.log('logged out');
        };

        $scope.set_current_user = function (id) {
            $scope.data.user = false;
            $scope.model = 'res.users';
            $scope.domain = [['id', '=', id]];
            $scope.fields = ['display_name'];
            jsonRpc.searchRead(
                $scope.model, $scope.domain, $scope.fields
            ).then(function (response) {
                $scope.data.user = response.records[0];
                /*storage.getItem("users_channels", function (channels) {
                    if (issues) {
                        $scope.data.employee_issues = JSON.parse(issues);
                        $scope.to_main();
                        console.log('loaded existing issues');
                    }
                    $scope.load_employee_issues().then(function() {
                        var users_issues = $scope.data.employee_issues;
                        storage.setItem('users_issues', JSON.stringify(users_issues));
                        $scope.to_main();
                        console.log('loaded new issues');
                    });
                });*/
            });
        };

        /* Search able employees
        function search_employee_issues () {
            var model = $scope.data.dataSource;
            var domain = [
                ['stage_id.name', 'not in', ['Done', 'Cancelled', 'On Hold']],
            ];
            var fields = [
                'name',
                'user_id',
                'project_id',
                'stage_id',
                'analytic_account_id',
            ];
            return jsonRpc.searchRead(
                model,
                domain,
                fields
            );
        }

        function process_employee_issues (response, deferred) {
            $scope.data.employee_issues = [];
            angular.forEach(response.records, function (issue) {
                $scope.data.employee_issues.push(issue);
            });
            deferred.resolve();
            var users_issues = $scope.data.employee_issues;
            storage.setItem('users_issues', JSON.stringify(users_issues));
        }

        // LOAD EMPLOYEE ISSUES
        $scope.load_employee_issues = function () {
            var deferred = new $.Deferred();
            search_employee_issues().then(
            // Success
                function (response) {
                    process_employee_issues(response, deferred);
                },
                odoo_failure_function
            );
            return deferred;
        };

        // Generic failure function
        var odoo_failure_function = function (response) {
            $scope.odoo_error = {
                'title': response.fullTrace.message,
                'type': response.fullTrace.data.exception_type,
                'message': response.fullTrace.data.message,
            };
            $scope.error = $scope.odoo_error.message;
        // $scope.errorModal();
        };*/

    }]);
