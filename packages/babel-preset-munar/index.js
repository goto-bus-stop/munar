module.exports = {
  presets: [
    [require('babel-preset-env'), {
      targets: {
        node: 6
      }
    }],
    require('babel-preset-stage-2')
  ],
  plugins: [
    require('babel-plugin-transform-decorators-legacy').default,
    require('babel-plugin-transform-export-extensions')
  ]
}
