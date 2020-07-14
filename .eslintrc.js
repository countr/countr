module.exports = {
    "env": {
        "commonjs": true,
        "es2020": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 11
    },
    "rules": {
        "no-unused-vars": ["off", { "vars": "all", "args": "after-used" }],
        "no-async-promise-executor": ["off", { "vars": "all", "args": "after-used" }],
        "no-cond-assign": ["off", { "vars": "all", "args": "after-used" }],
        "no-empty": ["off", { "vars": "all", "args": "after-used" }],
        "no-useless-escape": ["off", { "vars": "all", "args": "after-used" }],
        "no-constant-condition": ["off", { "vars": "all", "args": "after-used" }]
    }
};
