module.exports = {
  plugins: {
    "postcss-selector-namespace": {
      namespace (css) {
        return "#vueChildA"
      }
    }
  }

}