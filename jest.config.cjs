module.exports = {
  "transform": {
     "^.+\\.js$": "babel-jest",
     "^.+\\.ts$": "ts-jest",
     "^.+\\.svelte$": [
       "svelte-jester",
       { "preprocess": true }
     ]
  },
  "transformIgnorePatterns": [],
  "moduleFileExtensions": ["js", "ts", "svelte"],
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["@testing-library/jest-dom"],
  "moduleNameMapper": {
    "^\\$lib(.*?)(\\.js)?$": "<rootDir>/src/lib$1",
    "^\\$app(.*?)(\\.js)?$": [
      "<rootDir>/.svelte-kit/dev/runtime/app$1",
      "<rootDir>/.svelte-kit/build/runtime/app$1"
    ],
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
}
