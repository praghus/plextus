module.exports = {
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.test.{js,jsx,ts,tsx}', '!src/app.tsx'],
    // coverageThreshold: {
//   global: {
//     statements: 98,
//     branches: 91,
//     functions: 98,
//     lines: 98,
//   },
// },
coverageReporters: ['json', 'lcov', 'text-summary'],
    







moduleDirectories: ['node_modules', 'src'],
    







moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    







moduleNameMapper: {
        '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/config/jest-mocks/css-module.js',
        '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/config/jest-mocks/image.js'
    },
    







roots: ['<rootDir>/src'],

    







setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
    
    
    
    
    
    
    
    
    snapshotSerializers: ['enzyme-to-json/serializer'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest'
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$', '^.+\\.module\\.(css|sass|scss)$']
}
