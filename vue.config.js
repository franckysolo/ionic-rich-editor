module.exports = {
    chainWebpack: config => {
        ['vue-modules', 'normal-modules', 'normal'].forEach((match) => {
            config.module.rule('sass').oneOf(match).use('sass-loader')
              .tap(opt => {
                delete opt.data
                return opt
              })
        })
    }
}