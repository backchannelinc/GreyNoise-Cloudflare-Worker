////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// getGreynoise
// gets data from GreyNoise
// inputs:
//      ip: String
// outputs:
//      Object
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getGreynoise(ip) {
    
    // here is how you would get you greynoise token if stored in a KV
    //const GN_TOKEN = await your_worker_kv.get('GREYNOISE_API_KEY', {type:'text'})

    // instead we will get an envrionment var
    const GREYNOISE_TOKEN = GREYNOISE_API_KEY
    const GN_COMMUNITY_URL = 'https://api.greynoise.io/v3/community/'

    const data = await fetch(`${GN_COMMUNITY_URL}${ip}`, {
        headers: {
            'Accept': 'application/json',
            'key': GREYNOISE_TOKEN
        }
    })
    const COMMUNITY_RESPONSE = data.json()
    return COMMUNITY_RESPONSE
}

async function maliciousResponse(){
    const purgatory_url = 'https://rya.nc:1987'
    return Response.redirect(purgatory_url,301)
}

async function benignResponse(){
    return new Response("We're not so sure about you but here ya go.")
}

async function normalResponse(){
    return new Response("Hello normal, nice human!")
}

async function returnData(object){
    return new Response(JSON.stringify(object,null,4),{headers:{'content-type':'application/json'}})
}


async function handleRequest(request) {
    

    // UNCOMMENT THE LINE BELOW TO BYPASS GREYNOISE
    // return normalResponse()
    // this is for testing the speed of the worker
    
    // Get the client IP for the incoming request
    const clientIP = request.headers.get("CF-Connecting-IP")

    // get the GreyNoise enrichment for this IP
    const greynoiseResponse = await getGreynoise(clientIP)

    // get client URL request
    const url = new URL(request.url)
    uri = url.pathname

    // if the client is hitting the /info endpoint, just return the json
    if (uri === '/info') {
        const ts = Date.now()
        const cloudflare_data = request.cf
        const request_headers = Object.fromEntries(request.headers)
        return returnData({ts,clientIP,greynoiseResponse,request_headers,cloudflare_data})
    }

    // get GreyNoise classification
    // this may be null or undefined, but thats ok, we fail open ;)
    const greynoiseClassification = await greynoiseResponse['classification']

    // let's go ahead and print classifications to the console
    console.log(`[!] incoming request clientIP ${clientIP} has classification "${greynoiseClassification}" on GreyNoise: https://www.greynoise.io/viz/ip/${clientIP}`)

    // routing conditions
    if (greynoiseClassification === 'malicious'){
        return maliciousResponse()
    } else if (greynoiseClassification === 'benign'){
        return benignResponse()
    }
    else {
        return normalResponse()
    }
  }
  
  addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })