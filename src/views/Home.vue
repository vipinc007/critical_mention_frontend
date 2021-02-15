<template>
  <div class="home">
    <WeatherInfo />
  </div>
</template>

<script>
// @ is an alias to /src
import WeatherInfo from "@/components/Weather.vue";

export default {
  name: "Home",
  components: {
    WeatherInfo,
  },
};
</script>
