const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new MonacoWebpackPlugin({
          languages: [
            'json',
            'javascript',
            'typescript',
            'html',
            'css',
            'java',
            'python',
            'xml',
            'yaml'
          ]
        })
      ]
    }
  }
}; 