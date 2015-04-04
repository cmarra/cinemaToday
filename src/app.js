/**
 * Cinema Today
 * Developer: Christian Marra
 * Url: http://www.christianmarra.it
 * Made from Naples (Italy)
 */

var UI = require('ui');
var AJAX = require('ajax');

var UILoading = new UI.Card({
  title: 'CinemaToday',
  body: 'Loading...'
});
UILoading.show();

var UIError = new UI.Card({
  title: 'CinemaToday',
  body: 'Ajax failed :('
});

function locationSuccess(pos) {
    AJAX({url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+pos.coords.latitude+','+pos.coords.longitude, type: 'json'},
      function(googleapi) {
        var city = googleapi.results[0].address_components[2].short_name.split(" ");
        var URL = 'http://www.christianmarra.it/api/cinematoday?city='+city[0];
        AJAX({url: URL, type: 'json'},
          function(json) {
            if (json.length === 0 ) {
              UIError.show();
            } else {
              var cinemaMenu = [];
              for(var i = 0; i < json.theater.length; i++) {
                if (json.theater[i].name !== '') {
                  cinemaMenu.push({
                    title:json.theater[i].name,
                    subtitle:json.theater[i].info.replace("&#39;", "'")
                  });
                }
              }    
              var UIListCinema = new UI.Menu({
                sections: [{
                  title: 'Cinema',
                  items: cinemaMenu
                }]
              });
              UILoading.hide();
              UIListCinema.show();
              UIListCinema.on('select', function(cinemaSelect) {
                var moviesMenu = [];
                for(var i = 0; i < json.theater[cinemaSelect.itemIndex].movies.length; i++) {
                var name = decodeURIComponent(json.theater[cinemaSelect.itemIndex].movies[i].name);
                  moviesMenu.push({
                    title: name.replace("&amp;", "").replace("ccedil;", ""),
                    subtitle: json.theater[cinemaSelect.itemIndex].movies[i].time.join(', ')
                  });
                }
                var UIMovieList = new UI.Menu({
                  sections: [{
                    title: 'Movies',
                    items: moviesMenu
                  }]
                });
                UIMovieList.show();
                UIMovieList.on('select', function(movieSelect) {
                  var time = '';
                  var name = decodeURIComponent(json.theater[cinemaSelect.itemIndex].movies[movieSelect.itemIndex].name);
                  for(var i = 0; i < json.theater[cinemaSelect.itemIndex].movies[movieSelect.itemIndex].time.length; i++) {
                    time += json.theater[cinemaSelect.itemIndex].movies[movieSelect.itemIndex].time[i] + '\n';
                  }
                  var UIDetail = new UI.Card({
                    title: name.replace("&amp;", "").replace("ccedil;", ""),
                    body: time,
                    scrollable: true
                  });
                  UIDetail.show();
                });
              }); 
            }
          },
          function(error) {
            UIError.show();
          }
        );        
      },
      function(error) {
        UIError.show();
      }
    );
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
  var UIErrorLocation = new UI.Card({
    title: 'CinemaToday',
    scrollable: true,
    body: err.message
  });
  UIErrorLocation.show();
}

var locationOptions = {
  enableHighAccuracy: true,
  maximumAge: 0, 
  timeout: 60000
};

navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);