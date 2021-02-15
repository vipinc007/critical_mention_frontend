<template>
  <div class="hello">
    <h1>Weather information</h1>
    <places
      v-model="currentSearchedPlace.country.label"
      placeholder="search any location ?"
      @change="onLocationChange"
      :options="placesSearchOptions"
    >
    </places>

    <div v-if="errorWhileFindingYourLocation">
      Sorry, but the following error occurred:
      {{ errorWhileFindingYourLocation }}
    </div>

    <div v-if="isFindingYourLocation">
      <i>Getting your location...</i>
    </div>

    <div v-if="location">
      Your location data is {{ location.coords.latitude }},
      {{ location.coords.longitude }}
    </div>
    <br />
    <div v-if="weatherdata !== null">
      Your current or selected or previously selected location time zone is
      <strong>{{ weatherdata.timezone }}</strong>
    </div>
    <br />
    <div>
      <select class="form-control" v-model="currentWeatherView" required>
        <option value="current">Current</option>
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
      </select>
    </div>
    <br />
    <div>
      <table style="width:100%; text-align: left;">
        <tr>
          <th width="30%">dt</th>
          <th width="30%">high / Low</th>
          <th width="30%">condition</th>
        </tr>
        <tr
          v-for="item in getWeatherInfoByCurrentWeatherView()"
          :key="JSON.stringify(item) + currentWeatherView"
        >
          <td>{{ getFormatedDateToDisplay(item) }}</td>
          <td>{{ getTemperatureToDisplay(item.temp) }}</td>
          <td>{{ item.weather[0].main }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Utils from "@/service/utils.js";
import Places from "vue-places";
import DataAPI from "@/service/open_weather.js";
export default {
  name: "WeatherInfo",
  components: { Places },
  data: function() {
    return {
      apiObject: new DataAPI(),
      location: null,
      isFindingYourLocation: false,
      errorWhileFindingYourLocation: null,
      currentWeatherView: "current",
      weatherdata: null,
      placesSearchOptions: {
        appId: "pl76CO106DSQ",
        apiKey: "18183ac7abce5ce0e583f6674330e092",
        aroundLatLngViaIP: true,
        useDeviceLocation: true,
        // countries: ["US"],
      },
      currentSearchedPlace: {
        country: {
          label: null,
          data: {},
        },
      },
    };
  },
  created() {
    //do we support geolocation
    if (!("geolocation" in navigator)) {
      this.errorWhileFindingYourLocation = "Geolocation is not available.";
      return;
    }

    this.isFindingYourLocation = true;
    // get position
    let saved_location = Utils.get_saved_location();

    if (saved_location === null) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.isFindingYourLocation = false;
          this.location = pos;

          Utils.save_location({
            latitude: this.location.coords.latitude,
            longitude: this.location.coords.longitude,
          });
          this.load_weather(
            this.location.coords.latitude,
            this.location.coords.longitude
          );
        },
        (err) => {
          this.isFindingYourLocation = false;
          this.errorWhileFindingYourLocation = err.message;
        }
      );
    } else {
      this.isFindingYourLocation = false;
      this.load_weather(saved_location.latitude, saved_location.longitude);
    }
  },
  methods: {
    onLocationChange: function(newval) {
      console.log(newval);
      if (Object.keys(newval).length == 0) return;
      this.load_weather(newval.latlng.lat, newval.latlng.lng, true);
    },
    getFormatedDateToDisplay: function(item) {
      return new Date(
        (item.dt + this.weatherdata.timezone_offset) * 1000
      ).toLocaleString("en-US");
    },
    getTemperatureToDisplay: function(temp) {
      if (temp instanceof Object) {
        return `${temp.min} / ${temp.max}`;
      } else return temp;
    },

    getWeatherInfoByCurrentWeatherView: function() {
      if (this.weatherdata === null) return [];
      if (this.currentWeatherView == "current") {
        let arr = [];
        arr.push({ ...this.weatherdata.current });
        return arr;
      } else {
        return this.weatherdata[this.currentWeatherView];
      }
    },

    load_weather: function(latitude, longitude, save_location = false) {
      this.apiObject
        .doGet(`?lat=${latitude}&lon=${longitude}&exclude=minutely,alerts`)
        .then((results) => {
          if (results.RequestSuccess) {
            console.log(results);
            this.weatherdata = results;
            if (save_location)
              Utils.save_location({
                latitude: results.lat,
                longitude: results.lon,
              });
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {});
    },
  },
};
</script>
