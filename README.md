# GreyNoise-Cloudflare-Worker

This is a boilerplate for using the [GreyNoise API](https://docs.greynoise.io/reference/get_v3-community-ip) as an enrichment within a [Cloudflare Worker](https://workers.cloudflare.com/).

## How it works

1. Client makes a request to the Worker webservice
2. Using the Workers [`Request object`](https://developers.cloudflare.com/workers/runtime-apis/request), we extract the incoming request client IP
3. We look up that client IP on GreyNoise
4. Based on the GreyNoise classification, we return a different response.

In this example, there are three responses:

|GreyNoise classification|Response Function|What it does|
|---|---|---|
`malicious`| `maliciousResponse()` | Responds with a `301` redirect to an ASCII Rick Roll (thanks [@ryancdotorg](https://github.com/ryancdotorg))
`benign` | `benignResponse()` | Responds with 200 with plaintext message stating your benign-ness
Everything else | `normalResponse()` | Responds with 200 and welcomes you :)

## Why have you done this?

One of the best features of the Workers platform is the *speed*. Since the serverless Workers are deployed globally on Cloudflare's edge, there are some serious speed gains compared to running a webservice on a VPS somewhere.

Cloudflare WAF can handle *most* of your problems. But what if you wanted to do a very targeted lookup against a service you trust? This project is an example of how you might do that with [GreyNoise](https://www.greynoise.io/), which is doing cool work annotating web traffic.

## How much slower is it?
The benchmarks are OK. For regular humans browing the web, its almost negligble. I'd be dissappointed with any page load 10x slower than without the enrichment lookup.

| Test Case | Speed | Client Location | Performance Grade | Link |
| --- | --- | --- | --- | --- |
Without enrichment API lookup | 57 ms | San Francisco | 🟢 A | pingdom test](https://tools.pingdom.com/#5f5e0c1641800000)
With enrichment API lookup | 383 ms | San Francisco | 🟢 A | [pingdom test](https://tools.pingdom.com/#5f5e0b74cdc00000)
Without enrichment API lookup | 76 ms | San Francisco | N/A | [URLscan](https://urlscan.io/result/9df56034-f4a7-40f1-95a8-79579741b6d1/#transactions)
With enrichment API lookup | 444 ms | Frankfurt | N/A | [URLscan](https://urlscan.io/result/8cd98868-e608-432f-bf3d-ada058bf204f/#transactions)

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

## Publishing

Once you have your `wrangler.toml` filled out, you can publish your worker with the [`wrangler`](https://github.com/cloudflare/wrangler) CLI.
```
wrangler publish
```
though if you sourced your `wrangler.toml` in a directory like `.secrets`, you would run this:

```
wrangler publish -c .secrets/wrangler.toml
```