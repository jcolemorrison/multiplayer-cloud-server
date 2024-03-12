import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { Server } from "colyseus";
import { RedisPresence } from "@colyseus/redis-presence";

/**
 * Import your Room files
 */
import { GameRoom } from "./rooms/GameRoom";

let gameServerRef: Server;
let latencySimulationMs: number = 0;

export default config({
    options: {
        devMode: process.env.NODE_ENV && process.env.NODE_ENV === "production" ? false : true,
        presence: new RedisPresence({ 
            host: process.env.REDIS_HOST || "localhost",
            port: 6379,
        }),
    },

    initializeGameServer: (gameServer) => {
        gameServer.define('game_room', GameRoom);

        // keep gameServer reference, so we can
        // call `.simulateLatency()` later through an http route
        gameServerRef = gameServer;
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        // these latency methods are for development purpose only.
        app.get("/latency", (req, res) => res.json(latencySimulationMs));
        app.get("/simulate-latency/:milliseconds", (req, res) => {
            latencySimulationMs = parseInt(req.params.milliseconds || "100");

            // enable latency simulation
            gameServerRef.simulateLatency(latencySimulationMs);

            res.json({ success: true });
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
