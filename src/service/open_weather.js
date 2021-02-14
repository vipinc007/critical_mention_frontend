import axios from "axios";
("use strict");
export default class DataAPI {
  API_URL = null;
  API_KEY = "c1b05123eea170e5538e5c0219680474";
  constructor() {
    this.API_URL = "https://api.openweathermap.org/data/2.5/onecall";
  }
  doGet(apiname) {
    return axios
      .get(this.API_URL + apiname + "&appid=" + this.API_KEY)
      .then((response) => {
        this.results = response.data;
        this.results.RequestSuccess = true;
        return this.results;
      })
      .catch((err) => {
        this.results.Error = err;
        this.results.RequestSuccess = false;
        return this.results;
      });
  }
}
