module.exports = {
    plugins: [
        require('precss'),
        require('postcss-import'),
        require('postcss-preset-env'),
        require('cssnano')({autoprefixer: false})
    ]
}
