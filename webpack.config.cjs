const { createBaseWebpackConfig, createUMDExternal, createUMDLibraryDefinition, getPaths } = require('@misonou/build-utils');
const paths = getPaths();
const baseConfig = createBaseWebpackConfig();

module.exports = [
    {
        ...baseConfig,
        target: ['web', 'es5'],
        entry: {
            'brew-auth': './src/entry.js',
            'brew-auth.min': './src/entry.js',
        },
        output: {
            path: paths.dist,
            filename: '[name].js',
            uniqueName: 'brew-extension-auth',
            library: createUMDLibraryDefinition('@misonou/brew-extension-auth', 'brew.Auth')
        },
    },
    {
        ...baseConfig,
        target: ['web', 'es5'],
        entry: {
            'brew-auth-msal': './src/msal.js',
            'brew-auth-msal.min': './src/msal.js',
        },
        output: {
            path: paths.dist,
            filename: '[name].js',
            uniqueName: 'brew-extension-auth-msal',
            library: createUMDLibraryDefinition('@misonou/brew-extension-auth/msal', 'brew.Auth.MsalAuthProvider')
        },
        externals: {
            '@azure/msal-browser': createUMDExternal('@azure/msal-browser', 'msal')
        }
    }
];
