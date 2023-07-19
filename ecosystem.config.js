module.exports = {
  apps: [
    {
      name: "omcg",
      script: "dist/main.js",
      env: {
        NODE_ENV: "production"
      },
    },
  ],
};