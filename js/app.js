var app = angular.module('ionicApp', ['ionic'])
.run(function ($state, $rootScope) {
        Parse.initialize('0RMCDrKkOqYj6d7abhF4Ejcla1ufvGXbxrQ947g6', 'UCtlZRYKGcYOCThi8IYIBMmc3xSI9t6kwOfqtf5o');
        var currentUser = Parse.User.current();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            $state.go('home');
        }
    });


app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login')

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller:'signupCtrl'
        
    });

    $stateProvider.state('home', {
        url: '/home',
		 cache: false,
        templateUrl: 'home.html',
		controller:'homeCtrl'
    });
})


app.controller('signupCtrl',function($scope,$state,$ionicLoading, $rootScope){
	scope = $scope
	$scope.error = new Object();
    $scope.authorization = {
    username: '',
    password : ''
  };  
  
  $scope.signIn = function(form) {
    if(form.$valid) {
		$ionicLoading.show()
		 Parse.User.logIn(($scope.authorization.username).toLowerCase(), $scope.authorization.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('home', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
				console.log(err);
				
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
		
      
    }
  };  
             
})

app.controller('homeCtrl',function($scope,$state,$rootScope,$ionicPopup,$ionicModal){
	scope = $scope;
	root = $rootScope;
	$scope.todos = { todo:''};
	$scope.viewtodos = [];
	
	var todo = Parse.Object.extend("todos");
	var mtodo = new todo();
	
	query = new Parse.Query(todo);
	query.equalTo("user", $rootScope.user);

	query.find().then(function(results){
   			
			angular.forEach(results,function(el,index){
				console.log(el);
				var title = el.get("title");
				$scope.viewtodos.push(title);
				scope.$apply();
			})
			
        });
	
	$scope.addTodo = function(form){		
		if(form.$valid) {
			
			 $scope.closeModal();
			mtodo.set("title",$scope.todos.todo)
			mtodo.set("done",false);
			mtodo.set("user",Parse.User.current())
			mtodo.save(null, {
				
				success: function(gameScore) {
					$scope.viewtodos.push($scope.todos.todo);
					$scope.todos.todo = '';
					 $ionicPopup.alert({
              		 title: 'Todo added', 
						 template: 'Todo has been added successfuly ',
				});
				
			  },
			  error: function(gameScore, error) {
					 $ionicPopup.alert({
              		 title: 'Error', 
 					 template: 'Failed to create new object, with error code: ' + error.message,
				});
				
			  }
			});
		}
	}
	
	
    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('login', {
            clear: true
        });
    };
	
	
	
	$ionicModal.fromTemplateUrl('my-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	  }).then(function(modal) {
		$scope.modal = modal;
	  });
	  $rootScope.openModal = function() {
		$scope.modal.show();
	  };
	  $scope.closeModal = function() {
		$scope.modal.hide();
	  };
	  //Cleanup the modal when we're done with it!
	  $scope.$on('$destroy', function() {
		$scope.modal.remove();
	  });
	  // Execute action on hide modal
	  $scope.$on('modal.hidden', function() {
		// Execute action
	  });
	  // Execute action on remove modal
	  $scope.$on('modal.removed', function() {
		// Execute action
	  });
	
	
});