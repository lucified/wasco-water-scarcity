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

## Building a distribution

The end result of this project is a bunch of static HTML, CSS, JS and JSON
files. The files need to be hosted on the root path of the server and the
server needs to be configured to direct all requests to `/index.html` in order
to support react-router routing.

The following commands build a distribution bundle into `dist`. Upload these
files to your hosting server to deploy.

A *production* distribution:
```shell
NODE_ENV=production yarn run build
```

A *staging* distribution:
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

## Deploying to production

The production environment is currently managed by Lucify.
Production deployments require Lucify's production credentials.

Run a production deployment locally with:
```
yarn run deploy
```
