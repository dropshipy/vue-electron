import { testget } from "./testget.js";

new Vue({
  el: "#app",
  data: {
    newData: "helo",
  },
  mounted() {},
  methods: {
    callMyFunction() {
      const data = testget();
      console.log({ data });
    },
  },
});
