angular.module('conFusion.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $localStorage) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userInfo', '{}');

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userInfo', $scope.loginData);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function ($scope) {
    $scope.playlists = [
      {title: 'Reggae', id: 1},
      {title: 'Chill', id: 2},
      {title: 'Dubstep', id: 3},
      {title: 'Indie', id: 4},
      {title: 'Rap', id: 5},
      {title: 'Cowbell', id: 6}
    ];
  })

  .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL', function ($scope, menuFactory, corporateFactory, baseURL) {

    $scope.baseURL = baseURL;
    $scope.leader = corporateFactory.get({id: 3});
    $scope.showDish = false;
    $scope.message = "Loading ...";
    $scope.dish = menuFactory.get({id: 0})
      .$promise.then(
        function (response) {
          $scope.dish = response;
          $scope.showDish = true;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        }
      );
    $scope.promotion = menuFactory.get({id: 0});
  }])
  .controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicFilterBar',
    function ($scope, menuFactory, favoriteFactory, baseURL, $ionicListDelegate, $ionicFilterBar) {

      $scope.baseURL = baseURL;
      $scope.tab = 1;
      $scope.filtText = '';
      // $scope.showDetails = false;
      // $scope.showMenu = false;
      $scope.message = "Loading ...";

      menuFactory.query(
        function (response) {
          $scope.dishes = response;
          // $scope.showMenu = true;
        },
        function (response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });


      $scope.select = function (setTab) {
        $scope.tab = setTab;

        if (setTab === 2) {
          $scope.filtText = "appetizer";
        }
        else if (setTab === 3) {
          $scope.filtText = "mains";
        }
        else if (setTab === 4) {
          $scope.filtText = "dessert";
        }
        else {
          $scope.filtText = "";
        }
      };

      $scope.isSelected = function (checkTab) {
        return ($scope.tab === checkTab);
      };

      // $scope.toggleDetails = function () {
      //   $scope.showDetails = !$scope.showDetails;
      // };

      $scope.addFavorite = function (index) {
        console.log("index is " + index);
        favoriteFactory.addToFavorites(index);
        $ionicListDelegate.closeOptionButtons();
      };

      $scope.showFilterBar = function () {
        filterBar = $ionicFilterBar.show({
          items: $scope.dishes,
          update: function (filteredItems) {
            $scope.dishes = filteredItems
          }
          //filterProperties : 'first_name'
        });
      }

    }])
  .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'baseURL', '$ionicPopover', 'favoriteFactory', '$ionicModal', 'dishDetailFactory', '$timeout',
    function ($scope, $stateParams, dish, baseURL, $ionicPopover, favoriteFactory, $ionicModal, dishDetailFactory, $timeout) {

      $scope.baseURL = baseURL;
      $scope.showDish = false;
      $scope.dishId = parseInt($stateParams.id, 10);
      $scope.dish = {};
      $scope.rating = 0;
      $scope.dish = dish;

      $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
      });

      $scope.openPopover = function ($event) {
        $scope.popover.show($event);
      };

      $scope.closePopover = function () {
        $scope.popover.hide();
      };

      $scope.addFavoriteDetail = function () {
        var index = $scope.dishId;
        console.log("index is " + index);
        favoriteFactory.addToFavorites(index);
        $timeout(function () {
          $scope.closePopover();
        }, 1000);
      };

      $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.openModal = function () {
        $scope.modal.show();
        $timeout(function () {
          $scope.closePopover();
        }, 1000);
      };

      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.closeComment = function () {
        $scope.modal.hide();
      };

      $scope.showComment = function () {
        $scope.modal.show();
      };

      $scope.ratingsObject = {
        iconOn: 'ion-ios-star',
        iconOff: 'ion-ios-star-outline',
        iconOnColor: 'rgb(200, 200, 100)',
        iconOffColor: 'rgb(200, 100, 100)',
        rating: 1,
        minRating: 1,
        callback: function (rating) {
          $scope.ratingsCallback(rating);
        }
      };

      $scope.ratingsCallback = function (rating) {
        console.log('Selected rating is : ', rating);
        $scope.rating = rating;
      };

      $scope.addComment = function () {
        comment = {
          "rating": $scope.rating,
          "comment": $scope.dish.comments.comment,
          "author": $scope.dish.comments.author,
          "date": new Date()
        }
        $scope.dish.comments.push(comment);
        console.log('Selected rating is : ', $scope.dish.comments);
        $timeout(function () {
          $scope.closeComment();
          $scope.closePopover();
        }, 1000);
      };

    }])
  .controller('AboutUsController', ['$scope', 'corporateFactory', 'baseURL', function ($scope, corporateFactory, baseURL) {
    $scope.message = "Loading ...";
    $scope.baseURL = baseURL;
    $scope.showMenu = false;
    $scope.leaders = corporateFactory.query(
      function (response) {
        $scope.leaders = response;
        $scope.showMenu = true;
      },
      function (response) {
        $scope.message = "Error: " + response.status + " " + response.statusText;
      });

  }])
  .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate',
    '$ionicPopup', '$ionicLoading', '$timeout',

    function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout) {
      $scope.baseURL = baseURL;
      $scope.shouldShowDelete = false;
      $scope.favorites = favorites;

      $scope.dishes = dishes;

      $scope.toggleDelete = function () {

        $scope.baseURL = baseURL;
        $scope.shouldShowDelete = !$scope.shouldShowDelete;
        console.log($scope.shouldShowDelete);
      }

      $scope.deleteFavorite = function (index) {

        var confirmPopup = $ionicPopup.confirm({
          title: 'Confirm Delete',
          template: 'Are you sure you want to delete this item?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            console.log('OK delete');
            favoriteFactory.deleteFromFavorites(index);
          } else {
            console.log('Canceled delete');
          }

        });

        $scope.shouldShowDelete = false;

      }
    }

  ])
  .filter('favoriteFilter', function () {
    return function (dishes, favorites) {
      var out = [];
      for (var i = 0; i < favorites.length; i++) {
        for (var j = 0; j < dishes.length; j++) {
          if (dishes[j].id === favorites[i].id)
            out.push(dishes[j]);
        }
      }
      return out;

    }
  })
;




