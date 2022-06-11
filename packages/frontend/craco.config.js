const CracoAlias = require('craco-alias');

module.exports = {
  style: {
    postcssOptions: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.paths.json',
        unsafeAllowModulesOutsideOfSrc: true,
      },
    },
  ],
  eslint: {
    enable: false, //TODO enable eslint during build
  },
  webpack: {
    configure: {
      resolve: {
        /**
         * with CRA 5 (webpack5), webpack no longer ships with node polyfills.
         * Craco's team is looking to give it up (https://github.com/gsoft-inc/craco/issues/415).
         * Possible alternatives: react-app-rewired or ejecting from CRA
         */
        fallback: {
          'util': require.resolve("util/"),
        },
      },
      // with CRA 5 (webpack5), sourceMapLoader now complains about every third-party app that was compiled from
      // typescript but doesn't have 'ts' files.  This line ignores them.
      // See: https://github.com/facebook/create-react-app/issues/11924
      ignoreWarnings: [/to parse source map/i],
    }
  }
};
