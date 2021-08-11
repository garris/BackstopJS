const React = require('react');

const Search = require('./Search');
const Map = require('./Map');
const CurrentLocation = require('./CurrentLocation');
const LocationList = require('./LocationList');

const App = React.createClass({

  getInitialState() {
    // Extract the favorite locations from local storage

    let favorites = [];

    if (localStorage.favorites) {
      favorites = JSON.parse(localStorage.favorites);
    }

    // Nobody would get mad if we center it on Paris by default

    return {
      favorites: favorites,
      currentAddress: 'Paris, France',
      mapCoordinates: {
        lat: 48.856614,
        lng: 2.3522219
      }
    };
  },

  toggleFavorite(address) {
    if (this.isAddressInFavorites(address)) {
      this.removeFromFavorites(address);
    } else {
      this.addToFavorites(address);
    }
  },

  addToFavorites(address) {
    const favorites = this.state.favorites;

    favorites.push({
      address: address,
      timestamp: Date.now()
    });

    this.setState({
      favorites: favorites
    });

    localStorage.favorites = JSON.stringify(favorites);
  },

  removeFromFavorites(address) {
    const favorites = this.state.favorites;
    let index = -1;

    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].address == address) {
        index = i;
        break;
      }
    }

    // If it was found, remove it from the favorites array

    if (index !== -1) {
      favorites.splice(index, 1);

      this.setState({
        favorites: favorites
      });

      localStorage.favorites = JSON.stringify(favorites);
    }
  },

  isAddressInFavorites(address) {
    const favorites = this.state.favorites;

    for (let i = 0; i < favorites.length; i++) {
      if (favorites[i].address == address) {
        return true;
      }
    }

    return false;
  },

  searchForAddress(address) {
    const self = this;

    // We will use GMaps' geocode functionality,
    // which is built on top of the Google Maps API

    GMaps.geocode({
      address: address,
      callback: function (results, status) {
        if (status !== 'OK') return;

        const latlng = results[0].geometry.location;

        self.setState({
          currentAddress: results[0].formatted_address,
          mapCoordinates: {
            lat: latlng.lat(),
            lng: latlng.lng()
          }
        });
        setTimeout(function () {
          console.log('gmapResponded');
        }, 1000);
      }
    });
  },

  componentDidMount() {
    const that = this;
    setTimeout(function () {
      that.searchForAddress('San Francisco');
    }, 2000);
  },

  render() {
    return (

      <div>
        <h1>Your Google Maps Locations</h1>

        <Search onSearch={this.searchForAddress}/>

        <Map lat={this.state.mapCoordinates.lat} lng={this.state.mapCoordinates.lng}/>

        <CurrentLocation address={this.state.currentAddress}
                         favorite={this.isAddressInFavorites(this.state.currentAddress)}
                         onFavoriteToggle={this.toggleFavorite}/>

        <LocationList locations={this.state.favorites} activeLocationAddress={this.state.currentAddress}
                      onClick={this.searchForAddress}/>

      </div>

    );
  }

});

module.exports = App;
