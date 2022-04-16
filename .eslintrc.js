module.exports = {
    env: {
        'jest/globals': true
    },

    extends: [
        'plugin:eslint-comments/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:jsdoc/recommended',
        'plugin:promise/recommended',
        'plugin:react-hooks/recommended',
        'plugin:react-redux/recommended',
        'plugin:react/recommended',
        'plugin:redux-saga/recommended',
        'prettier'
    ],

    overrides: [
        {
            files: ['*.{js,jsx}'],
            parser: '@babel/eslint-parser'
        },
        {
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript', 'prettier'],
            files: ['*.{ts,tsx}'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true // Allows for the parsing of JSX
                },
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 0
            },
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx']
                }
            }
        },
        {
            extends: ['plugin:jest/recommended', 'plugin:testing-library/react'],
            files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
            rules: {
                'react/jsx-props-no-spreading': 0,
                'testing-library/prefer-screen-queries': 0
            }
        }
    ],

    plugins: [
        'jest',
        'jsdoc',
        'new-with-error',
        'perf-standard',
        'promise',
        'react-redux',
        'redux-saga',
        'testing-library',
        'sort-keys-fix'
    ],

    rules: {
        'consistent-return': 1,
        'default-case': 0,
        'eslint-comments/disable-enable-pair': 0,
        'func-names': 0,
        'global-require': 0,
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never'
            }
        ],
        'import/no-cycle': 0,
        'import/no-extraneous-dependencies': 0,
        'import/prefer-default-export': 0,
        'jsdoc/check-examples': 0,
        'jsdoc/check-tag-names': 0,
        'jsdoc/no-undefined-types': 0,
        'jsdoc/require-example': 0,
        'jsdoc/require-file-overview': 0,
        'jsdoc/require-jsdoc': 0,
        'jsdoc/require-param-description': 0,
        'jsdoc/require-param-type': 0,
        'jsdoc/require-property-description': 0,
        'jsdoc/require-returns': 0,
        'jsdoc/require-returns-description': 0,
        'jsdoc/require-yields': 0,
        'jsdoc/valid-types': 0,
        'no-cond-assign': 1,
        'no-continue': 1,
        'no-param-reassign': 1,
        'no-restricted-properties': 0,
        'no-restricted-syntax': 0,
        'no-return-assign': 1,
        'no-return-await': 1,
        'no-shadow': 0,
        'no-underscore-dangle': 0,
        'no-unused-expressions': 0,
        'no-use-before-define': 0,
        'no-useless-escape': 0,
        'perf-standard/check-function-inline': 0,
        'perf-standard/no-instanceof-guard': 2,
        'perf-standard/no-self-in-constructor': 2,
        'prefer-arrow-callback': 0,
        'prefer-rest-params': 0,
        quotes: [1, 'single'],
        radix: 0,
        'react-hooks/exhaustive-deps': 0,
        'react-redux/prefer-separate-component-file': 0,
        'react/default-props-match-prop-types': 0,
        'react/destructuring-assignment': 0,
        'react/display-name': [2, { ignoreTranspilerName: true }],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'react/jsx-fragments': 0,
        'react/jsx-no-bind': 0,
        'react/jsx-props-no-spreading': 0,
        'react/no-array-index-key': 0,
        'react/prop-types': [1, { ignore: ['children', 'className'] }],
        'react/require-default-props': 0,
        'react/sort-comp': 0,
        'react/state-in-constructor': 0,
        'react/static-property-placement': 0,
        'require-yield': 0,
        semi: [2, 'never'],
        'sort-keys-fix/sort-keys-fix': 'warn'
    },

    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                paths: ['src']
            }
        },
        react: {
            version: 'detect'
        }
    }
}
