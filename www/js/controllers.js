
angular.module('myApp')

// Controller

.controller('VideosController', function ($scope, $http, $log, VideosService) {

    init();

    function init() {
      $scope.youtube = VideosService.getYoutube();
      $scope.results = VideosService.getResults();
      $scope.history = VideosService.getHistory();
    }

    ons.ready(function() {
      ons.createPopover('popover.html').then(function(popover) {
        $scope.popover = popover;
      });
    });

    var options = [];

    options.push({
      text: 'All Movies', 
      value: 0
    });
    options.push({
      text: 'Movie HD', 
      value: 1
    });
    options.push({
      text: 'Action Films', 
      value: 32
    });
    options.push({
      text: 'Classic Films', 
      value: 33
    });
    options.push({
      text: 'Family Movies', 
      value: 37
    });
    options.push({
      text: 'Education Films', 
      value: 27
    });
    options.push({
      text: 'Horror Movies', 
      value: 39
    });
    options.push({
      text: 'Short Movies', 
      value: 18
    });
    options.push({
      text: 'Comedy', 
      value: 23
    });
    options.push({
      text: 'Drama', 
      value: 36
    });

    $scope.options = options;

    $scope.setCategory = function(options) {
      $scope.modifier = '-';
      $scope.selectedCategory = options.text;
      VideosService.setCategoryId(options.value);
      $scope.search(true);
    }

    $scope.isAndroid = function() {
      return ons.platform.isAndroid();
    }
    $scope.updateToolbar = function(title) {
      $scope.toolbarTitle = title;
    }

    $scope.focusInput = function(platform) {
      document.getElementById(platform + '-search-input').focus();
    };

    $scope.blurInput = function(platform) {
      document.getElementById(platform + '-search-input').blur();
    };

    $scope.launch = function (video, archive) {
      VideosService.launchPlayer(video.id, video.title);
      if (archive) {
      	VideosService.archiveVideo(video);
      }
      $log.info('Launched id:' + video.id + ' and title:' + video.title);
    };

    $scope.nextPageToken = '';
    $scope.labelSearch = 'You haven\'t searched for any video yet!';
    $scope.labelHistory = 'You haven\'t watched any video yet!';

    $scope.loading = false;

    $scope.loadMore = function(done) {
      $scope.search(false).then(done);
    };

    $scope.search = function (isNewQuery) {
      $scope.loading = true;
      
      if (this.query != undefined)
        VideosService.setQueryText(this.query);

      console.log("Category: " + $scope.selectedCategory + " ID: " + VideosService.getCategoryId() + " Query: " + VideosService.getQueryText());
      
      return $http.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyAaVxe2e6AbU3FD2pKTQh1_AySRHC1NY8I',
          q: VideosService.getQueryText(), 
          type: 'video',
          maxResults: '10',
          categoryId: VideosService.getCategoryId() == 0 ? '' : VideosService.getCategoryId(), 
          videoType: VideosService.getCategoryId() == 0 ? 'movie' : 'any', 
          pageToken: isNewQuery ? '' : $scope.nextPageToken,
          part: 'id,snippet',
          fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken'
        }
      })
      .success( function (data) {
        if (data.items.length === 0) {
          $scope.label = 'No results were found!';
        }
        VideosService.listResults(data, $scope.nextPageToken && !isNewQuery);
        $scope.nextPageToken = data.nextPageToken;
        $scope.loading = false;
      })
      .error( function (e) {
        $log.info('Search error: ', e);
        $scope.loading = false;
      });
    };
});
