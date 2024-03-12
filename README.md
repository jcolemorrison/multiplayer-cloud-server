# Multiplayer Cloud Server Demo

```
npm install
npm start
```

The WebSocket server should be available locally at `ws://localhost:2567` ([http://localhost:2567](http://localhost:2567) should be accessible.).  It automatically binds to `0.0.0.0`, so it will also be availble on the machine's IP as well.

It also requires setting a `NODE_ENV` (defaults to `development`) environment variable and a `REDIS_HOST` (defaults to `localhost`) environment variable.