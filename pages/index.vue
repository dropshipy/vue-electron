<script>
export default {
  middleware({ route, redirect }) {
    return redirect({ path: '/home', query: { from_login: route.query.from_login } });
  }
}

</script>

<template>
  <h1>Index</h1>
</template>