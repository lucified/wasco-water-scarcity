# WASCO Global Water Atlas visualizations

This project contains three separate buildable apps: a tool for looking at
historical data, a tool for looking at future predictions, and embeddable
single visualizations.

## Development

Requires Node 8 or greater and `yarn`.

Set up the development environment with:

```shell
yarn
```

Start a local development server with mock data:

```shell
yarn start
```

Then open http://localhost:3000 in your web browser.

By default, the history app is built. To build a different app, use the `APP`
environment variable with `future` or `embed`:

```shell
APP=future yarn start
```

### Linting & Prettier

To lint the code, run:

```shell
yarn run lint
```

To prettify the whole code base, run:

```shell
yarn run prettify
```

### Testing embeds

To test embeds inside an iframe, start the development server for the `embed`
APP (`APP=embed yarn start`) and open the `src/embed-test.html` page in a
browser.

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

The following command builds a production distribution bundle into `dist`.
Upload these files to your hosting server to deploy.

```shell
yarn run build
```

By default, the history app is built. To build a different app, use the `APP`
environment variable with `future` or `embed`:

```shell
APP=future yarn run build
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

```shell
yarn run deploy
```

## Embedding a visualization in a page

In order to embed a visualization, the host page needs to have the
[iframe-resizer](https://github.com/davidjbradshaw/iframe-resizer) code on the
embedding page with either:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.6.0/iframeResizer.min.js"></script>
```

or by placing the contents of this file inside a `<script>` tag. Once that's
done, something like the below should be done per embed:

```html
<iframe id="myIframe" src="http://wasco-embed.lucify.com/stress" scrolling="no"></iframe>
<script>iFrameResize({}, '#myIframe')</script>
```
