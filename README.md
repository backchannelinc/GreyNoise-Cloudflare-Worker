# GreyNoise-Cloudflare-Worker

## Running locally in development mode

The best development experience for running locally is with [miniflare](https://miniflare.dev/), which does an excellent job simulating the Workers platform. 

To do this, just run
```
miniflare index.js -w
```
This will run the default `wrangler.toml`, which is a template. To run a specific `wrangler.toml` that is perhaps filled with secrets like your GreyNoise API token and your Cloudflare ID info, you can specify a specific wrangler.toml by running something like this:
```
miniflare -c .secrets/wrangler.toml index.js -w
```
To simulate the environment variable `GREYNOISE_API_KEY` you will also need to pass it as a command line arg:
```
miniflare -c .secrets/wrangler.toml index.js -w --binding GREYNOISE_API_KEY=<your GreyNoise API key>
```
To route a tunnel to your localhost development runtime you could even use something like [cloudflared](https://github.com/cloudflare/cloudflared) or [ngrok](https://ngrok.com/) to better simulate web traffic.