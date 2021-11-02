<template>
  <div id="app">
    <p>{{ message }}</p>
    <button v-show="!oauth && !hideBtns" @click.stop="getOAuthUrl">Login with Google</button>
    <button v-show="oauth && !hideBtns" @click.stop="checkAuthStatus">I Logged In Successfully</button>
  </div>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    hideBtns: false,
    oauth: false,
    message: ''
  }),

  methods: {
    async getOAuthUrl() {
      const resp = await fetch("https://services.local.ejmorgan.com/vscode/9005/oauth?id=qw34wq");
      const { url } = await resp.json();
      window.open(url, "GoogleOAuth", "height=600,width=450,left=300,top=100");
      this.oauth = true;
      this.message = 'Waiting for user to complete authorization flow...';
    },
    async checkAuthStatus() {
      const resp = await fetch("https://services.local.ejmorgan.com/vscode/9005/oauth/qw34wq");
      const { ok } = await resp.json();

      if (!ok) {
        this.hideBtns = false;
        this.message = 'Failed to complete authorization flow.';
      } else {
        this.hideBtns = true;
        this.message = 'Completed authorization flow.';
      }

      this.oauth = false;
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
