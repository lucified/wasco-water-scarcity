# WASCO water shortage visualisation

## Development

Requires Node 6 or greater and `yarn`.

Set up the development environment with:
```shell
yarn
```

Start a local development server with mock data:
```shell
yarn start
```

Then open http://localhost:3000 in your web browser.

### Linting & Prettier

To lint the code, run:
```shell
yarn run lint
```

To prettify the whole code base, run:
```shell
yarn run prettify
```

## Using new datasets

The datasets are defined in `src/data/datasets.ts`. The URL defined in the `url`
field should be one that accepts AJAX requests, i.e. CORS should be configured
appropriately.

To upload new datasets to Lucify hostiung, assume the AWS admin role, place the
data in the appropriate folder under `data-external/wasco` and run:
```shell
yarn run upload-data
```

These files will be available under
`https://s3-eu-west-1.amazonaws.com/lucify-large-files/wasco/`.


## Building deployment distributions

All the following build commands should be executed in the project root folder.

Build a *production* distribution into `dist` with:
```shell
NODE_ENV=production yarn run build
```

Build a *staging* distribution into `dist` with:
```shell
NODE_ENV=staging yarn run build
```

You can test a distribution by:
```shell
cd dist
ws
```

This will start a light-weight local server at [http://localhost:8000](http://localhost:8000).
To use the `ws` command, you need to install `local-web-server`
```shell
yarn add global local-web-server
```
