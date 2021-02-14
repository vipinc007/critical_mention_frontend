import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import DataAPI from "@/service/open_weather.js";

Vue.config.productionTip = false;
Vue.prototype.$dataAPI = new DataAPI();

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
