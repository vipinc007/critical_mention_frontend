<template>
  <div class="hello">
    <h1>Weather information</h1>
    <places
      v-model="form.country.label"
      placeholder="Where are we going ?"
      @change="onLocationChange"
      :options="options"
    >
    </places>

    <div v-if="errorStr">
      Sorry, but the following error occurred: {{ errorStr }}
    </div>

    <div v-if="gettingLocation">
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
      <select class="form-control" v-model="drpView" required>
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
          <th width="30%">
            high / Low
          </th>
          <th width="30%">condition</th>
        </tr>
        <!-- {{
        getSeletcedWeatherView()
      }} -->
        <tr
          v-for="item in getSeletcedWeatherView()"
          :key="JSON.stringify(item) + drpView"
        >
          <td>
            {{ getDateDetails(item) }}
          </td>
          <td>{{ getTempDetails(item.temp) }}</td>
          <td>{{ item.weather[0].main }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars

import Utils from "@/service/utils.js";
import Places from "vue-places";
export default {
  components: { Places },
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data: function() {
    return {
      firstName: "test",
      lastName: "wow",
      address: "",
      location: null,
      gettingLocation: false,
      errorStr: null,
      drpView: "current",
      weatherdata: null,
      options: {
        appId: "pl76CO106DSQ",
        apiKey: "18183ac7abce5ce0e583f6674330e092",
        // countries: ["US"],
      },
      form: {
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
      this.errorStr = "Geolocation is not available.";
      return;
    }

    this.gettingLocation = true;
    // get position
    let saved_location = Utils.get_saved_location();

    if (saved_location === null) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.gettingLocation = false;
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
          this.gettingLocation = false;
          this.errorStr = err.message;
        }
      );
    } else {
      this.gettingLocation = false;
      this.load_weather(saved_location.latitude, saved_location.longitude);
    }
    //Utils.clear_storage();
  },
  mounted: function() {
    this.$nextTick(function() {
      // this.load_weather();
      // this.$refs.address.focus();
      // for (let ref in this.$refs) {
      //   eval("new google.maps.places.Autocomplete('" + this.$refs[ref] + "')");
      // }
    });
  },
  methods: {
    onLocationChange: function(newval) {
      console.log(newval);
      this.load_weather(newval.latlng.lat, newval.latlng.lng, true);
    },
    getDateDetails: function(item) {
      return new Date(
        (item.dt + this.weatherdata.timezone_offset) * 1000
      ).toLocaleString("en-US");
    },
    getTempDetails: function(temp) {
      if (temp instanceof Object) {
        return `${temp.min} / ${temp.max}`;
      } else return temp;
    },
    getAddressData: function(addressData) {
      this.address = addressData;
      // let k = placeResultData;
      // let idd = id;
    },
    getSeletcedWeatherView: function() {
      if (this.weatherdata === null) return [];

      if (this.drpView == "current") {
        let arr = [];
        arr.push(this.weatherdata.current);
        return arr;
      } else {
        return this.weatherdata[this.drpView];
      }
    },
    timeConverter: function(UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time =
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
      return time;
    },
    getFullName: function() {
      const t = "ttt";
      let k = "sdfsdf";
      return this.firstName + " " + this.lastName + t + k;
    },

    load_weather: function(lat, long, save_preference = false) {
      this.$dataAPI
        .doGet("?lat=" + lat + "&lon=" + long + "&exclude=minutely,alerts")
        .then((results) => {
          if (results.RequestSuccess) {
            console.log(results);
            this.weatherdata = results;
            if (save_preference)
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
