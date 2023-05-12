import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.js$": "babel-jest"
    }
};

export default config;