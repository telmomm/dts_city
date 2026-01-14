const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopywebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode: 'development',
    context: __dirname,
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),

        // Needed to compile multiline strings in Cesium
        sourcePrefix: ''
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
            },
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: ['url-loader'],
          },
          { 
            test: /\.(glb|gltf)$/,
            use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: '[name].[ext]',
                    outputPath: 'public/3DModels/bus',
                  },
                },
            ],
          }
        ],
      },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin({ 
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
            ]
        }),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify(''),
            // Define environment variables for browser
            'process.env.REACT_APP_OPENSKY_USERNAME': JSON.stringify(process.env.REACT_APP_OPENSKY_USERNAME || ''),
            'process.env.REACT_APP_OPENSKY_PASSWORD': JSON.stringify(process.env.REACT_APP_OPENSKY_PASSWORD || ''),
            'process.env.REACT_APP_CESIUM_ION_TOKEN': JSON.stringify(process.env.REACT_APP_CESIUM_ION_TOKEN || ''),
            'process.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''),
            'process.env.REACT_APP_WEBCAM_API_TOKEN': JSON.stringify(process.env.REACT_APP_WEBCAM_API_TOKEN || ''),
            'process.env.REACT_APP_CONFIG_SERVICE_TOKEN': JSON.stringify(process.env.REACT_APP_CONFIG_SERVICE_TOKEN || '')
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
    ],
    // development server options
    devServer: {
        static: path.join(__dirname, "dist")
    },
    resolve: {
        alias: {
            // CesiumJS module name
            cesium: path.resolve(__dirname, cesiumSource)
        },
        fallback: {
            process: require.resolve('process/browser'),
            stream: require.resolve("stream-browserify"),
            http: require.resolve("http-browserify"),
            https: require.resolve("https-browserify"),
            zlib: require.resolve('browserify-zlib'),
            assert: require.resolve('assert/'),
            'process-nextick-args': require.resolve('process-nextick-args/'),
            'core-util-is': require.resolve('core-util-is/'),
            inherits: require.resolve('inherits/'),
            events: require.resolve('events/'),
            util: require.resolve('util/'),
            'util-deprecate': require.resolve('util-deprecate'),
            'side-channel': require.resolve('side-channel'),
            vm: require.resolve('vm-browserify'),
            querystring: require.resolve('querystring-es3'),
            url: false

        }
    }
};
