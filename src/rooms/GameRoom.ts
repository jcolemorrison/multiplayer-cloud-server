import { Room, Client } from "colyseus";
import { InputData, MyRoomState, Player } from "./GameState";

export const avatars = [
  'Boundary',
  'Consul',
  'Nomad',
  'Packer',
  'Terraform',
  'Vagrant',
  'Vault',
  'Waypoint',
]

export class GameRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60;

  onCreate (options: any) {
    this.setState(new MyRoomState());

    // set map dimensions
    this.state.mapWidth = 2048;
    this.state.mapHeight = 2048;

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });
  }

  fixedTick(timeStep: number) {
    const velocity = 2;
    const avatarSize = 32;

    this.state.players.forEach(player => {
      let input: InputData;

      // dequeue player inputs
      while (input = player.inputQueue.shift()) {
        if (input.left) {
          player.x = Math.max(avatarSize / 2, player.x - velocity);
        } else if (input.right) {
          player.x = Math.min(this.state.mapWidth - avatarSize / 2, player.x + velocity);
        }

        if (input.up) {
          player.y = Math.max(avatarSize / 2, player.y - velocity);
        } else if (input.down) {
          player.y = Math.min(this.state.mapHeight - avatarSize / 2, player.y + velocity);
        }

        player.tick = input.tick;
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();

    // Define the spawn area as a percentage of the map size
    // const spawnAreaPercentage = 0.25;
    // const spawnAreaWidth = this.state.mapWidth * spawnAreaPercentage;
    // const spawnAreaHeight = this.state.mapHeight * spawnAreaPercentage;

    // const minX = this.state.mapWidth / 2 - spawnAreaWidth / 2;
    // const minY = this.state.mapHeight / 2 - spawnAreaHeight / 2;

    player.x = Math.random() * this.state.mapWidth;
    player.y = Math.random() * this.state.mapHeight;

    // Assign a random avatar to the player
    player.avatar = avatars[Math.floor(Math.random() * avatars.length)];

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
