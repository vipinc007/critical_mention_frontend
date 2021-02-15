<template>
  <div class="hello">
    <h1>Find Weather Information</h1>
    <br />
    <div>Search the location of your choice in the below box:</div>
    <places
      v-model="currentSearchedPlace.country.label"
      placeholder="search any location here"
      @change="onLocationChange"
      :options="placesSearchOptions"
    >
    </places>
    <br />
    <br />

    <div v-if="errorWhileFindingYourLocation">
      Sorry, but the following error occurred:
      {{ errorWhileFindingYourLocation }}
    </div>

    <div v-if="isFindingYourLocation">
      <i>Getting your location...</i>
    </div>

    <div v-if="location">
      <strong
        >Your current or selected or previously selected location details are
      </strong>
      <div>
        (Lat, Lon) :
        <strong>{{ location.latitude }}, {{ location.longitude }}</strong>
      </div>
      <div>
        <span
          v-if="
            location.locationLabel !== null || location.locationLabel !== ''
          "
          >Place : <strong>{{ location.locationLabel }}</strong>
        </span>
      </div>
      <div v-if="weatherdata !== null">
        Time Zone : <strong>{{ weatherdata.timezone }}</strong>
      </div>
    </div>

    <br />
    <div>
      <strong>Below are the weather details for the above location</strong>
    </div>

    <div>
      Weather View :
      <select class="form-control" v-model="currentWeatherView" required>
        <option value="current">Current</option>
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
      </select>
      (You can change the dropdown to see different views of weather info)
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
          <td>{{ getWeatherConditionInfoToDisplay(item) }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Utils from "@/common/utils.js";
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
    if (!("geolocation" in navigator)) {
      this.errorWhileFindingYourLocation = "Geolocation is not available.";
      return;
    }
    this.isFindingYourLocation = true;
    let saved_location = Utils.get_saved_location();
    if (saved_location === null) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.isFindingYourLocation = false;
          this.location = this.getLocationObjectToSave(
            pos.coords.latitude,
            pos.coords.longitude
          );

          Utils.save_location(this.location);
          this.load_weather(...Object.values(this.location));
        },
        (err) => {
          this.isFindingYourLocation = false;
          this.errorWhileFindingYourLocation = err.message;
        }
      );
    } else {
      this.isFindingYourLocation = false;
      this.location = saved_location;
      this.load_weather(...Object.values(saved_location));
      if (
        saved_location.locationLabel !== undefined &&
        saved_location.locationLabel !== null
      )
        this.currentSearchedPlace.country.label = saved_location.locationLabel;
    }
  },
  methods: {
    onLocationChange: function(newval) {
      console.log(newval);
      if (Object.keys(newval).length == 0) return;
      this.load_weather(
        newval.latlng.lat,
        newval.latlng.lng,
        newval.value,
        true
      );
    },
    getLocationObjectToSave: (latitude, longitude, locationLabel = null) => {
      return {
        latitude: latitude,
        longitude: longitude,
        locationLabel: locationLabel,
      };
    },
    getFormatedDateToDisplay: function(item) {
      return new Date(
        (item.dt + this.weatherdata.timezone_offset) * 1000
      ).toLocaleString("en-US");
    },
    getTemperatureToDisplay: (temp) => {
      if (temp instanceof Object) return `${temp.max} / ${temp.min}`;
      else return temp;
    },
    getWeatherConditionInfoToDisplay: (item) => {
      if (
        item.weather === undefined ||
        item.weather === null ||
        item.weather.length == 0
      )
        return "";
      return item.weather[0].main;
    },
    getWeatherInfoByCurrentWeatherView: function() {
      if (this.weatherdata === null) return [];
      if (this.currentWeatherView == "current") {
        let arr = [];
        arr.push({ ...this.weatherdata.current });
        return arr;
      } else return this.weatherdata[this.currentWeatherView];
    },

    load_weather: function(
      latitude,
      longitude,
      locationLabel = null,
      save_location = false
    ) {
      this.apiObject
        .doGet(`?lat=${latitude}&lon=${longitude}&exclude=minutely,alerts`)
        .then((results) => {
          if (results.RequestSuccess) {
            console.log(results);
            this.weatherdata = results;
            if (save_location) {
              this.location = this.getLocationObjectToSave(
                results.lat,
                results.lon,
                locationLabel
              );
              Utils.save_location(this.location);
            }
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
