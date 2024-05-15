const config = {
    "testEnvironment": "./tests/environment",
    "setupFilesAfterEnv": [
        "@misonou/test-utils/mock/console",
        "@misonou/test-utils/mock/performance"
    ],
    "modulePathIgnorePatterns": [
        "<rootDir>/build/"
    ],
    "moduleNameMapper": {
        "^src/(.*)$": "<rootDir>/src/$1"
    },
    "clearMocks": true,
    "collectCoverageFrom": [
        "src/**/*.js",
        "!src/examples/**/*",
        "!src/{entry,errorCode,index}.js"
    ]
}

if (process.env.CI !== 'true' && require('fs').existsSync('../zeta-dom')) {
    config.moduleNameMapper = {
        ...config.moduleNameMapper,
        "^brew-js/(.*)$": "<rootDir>/../brew-js/src/$1",
        "^zeta-dom/(.*)$": "<rootDir>/../zeta-dom/src/$1"
    };
}

module.exports = config;
