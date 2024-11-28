// from https://github.com/pandada8/huggingface-cloudflare-worker


function nginx() {
    const text = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to nginx!</title>
    <style>
      body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
      }
    </style>
    </head>
    <body>
    <h1>Welcome to nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and
    working. Further configuration is required.</p>
    
    <p>For online documentation and support please refer to
    <a href="http://nginx.org/">nginx.org</a>.<br/>
    Commercial support is available at
    <a href="http://nginx.com/">nginx.com</a>.</p>
    
    <p><em>Thank you for using nginx.</em></p>
    </body>
    </html>
    `
    return text ;
  }
  export default {
    
    async  fetch(request) {
      console.log(request.url)
      let url = new URL(request.url)
      if (request.method != 'GET' && request.method != 'HEAD') {
        return new Response('Method Not Allowed', { status: 405 })
      }
    
      if (url.pathname == '/') {
        return new Response(nginx(), {headers: {'content-type': 'text/html'}})
      }
      const matched = url.pathname.match(/^\/___FIX_HEADER\/(.*.hf.co\/.*)/)
      if (matched) {
        const ret = new Request('https://' + matched[1] + url.search, {headers: request.headers, method: 'GET'})
        return fetch(ret)
      }
      const target = new URL("https://huggingface.co" + url.pathname)
      const req = new Request(target, {headers: request.headers, method: 'HEAD', redirect: 'manual'})
      const firstResponse = await fetch(req)
      console.log(firstResponse.status)
      if (firstResponse.status == 302) {
        const location = new URL(firstResponse.headers.get('location'))
        const newLocation = `https://${url.hostname}/___FIX_HEADER/${location.hostname}${location.pathname}${location.search}`
        let headers = new Headers();
        for (const [key, value] of firstResponse.headers) {
          if (key != 'location' && key != 'access-control-allow-origin' ) {
            headers.set(key, value);
          }
        }
        headers.set('location', newLocation);
        console.log(headers);
        return new Response(null, {
          status: 302,
          headers: headers,
        })
      } else {
        return fetch(req, {
          method:'GET',
          redirect: 'manual',
        })
      }
    }
    
    }
    
    
    
    function serveIndex(url) {
      return 
    }
    
