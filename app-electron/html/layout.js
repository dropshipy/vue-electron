// app.js
// Define your layout component
const Layout = {
  template: `
    <div>
      <header>
        <h1 class="text-red-500">Your App Title</h1>
        <div class="flex">
        <slot></slot>
        <p>halo layout</p>
        </div>
      </header>
    </div>
  `,
};
const router = new VueRouter({
  routes: [
    {
      path: "/",
      component: { template: "<div>Hello from the main content!</div>" },
    },
    {
      path: "/test.html",
      component: { template: "<div>Content for another page</div>" },
    },
    // Add more routes as needed
  ],
});
const app = new Vue({
  el: "#app",
  components: {
    Layout,
  },
  mounted() {
    const getUserInfo = localStorage.getItem("user_info");
    console.log(getUserInfo);
  },
  template: "<Layout></layout>",
});
