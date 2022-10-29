import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from "module";
import path from 'path';
import { Configuration } from 'webpack';

const require = createRequire(import.meta.url);

const projectDirectory = process.cwd();

export const baseConfig: Configuration = {
   entry: [
      path.resolve(projectDirectory, 'src/index.ts'),
      path.resolve(projectDirectory, 'src/styles.scss'),
   ],
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: require.resolve('ts-loader'),
            exclude: /node_modules/,
         },
         {
            test: /\.scss$/,
            use: [
               {
                  loader: require.resolve('style-loader'),
               },
               {
                  loader: require.resolve('css-loader'),
               },
               {
                  loader: require.resolve('sass-loader'),
                  options: {
                     sassOptions: {
                        includePaths: ['./node_modules'],
                     },
                  },
               },
            ],
         },
      ],
   },
   resolve: {
      extensions: ['.ts', '.js'],
   },
   output: {
      filename: 'bundle.js',
      path: path.resolve(projectDirectory, 'dist'),
   },
   mode: 'development',
   devServer: {
   },
   plugins: [new HtmlWebpackPlugin({
      template: path.resolve(projectDirectory, 'index.html'),
      inject: true,
   })],
};
