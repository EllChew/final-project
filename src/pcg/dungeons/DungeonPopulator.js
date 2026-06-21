import { Rect } from "./util/Rect";
import { getRandomInt } from "./util/randomHelper";
import { Partition } from "./Partition";
import { Tile } from "../../maps/Tile";

// After initial dungeon generation, populate dungeon 
export class DungeonPopulator {

    static generate(map, floor) {
        this.player(map);
        this.stairs(map);
        this.trees(map, floor);
        this.enemy(map, floor);
        this.bush(map);
        this.hole(map);
        this.bone(map, floor);
    }

    // Set player spawn location
    static player(map) {
        let tile = map.getRandomWalkableTile();
        while (tile.type != Tile.Type.Ground) {
            tile = map.getRandomWalkableTile()
        }
        tile.type = Tile.Type.PlayerSpawn;
    }

    // set stair location
    static stairs(map) {
        let tile = map.getRandomWalkableTile();
        while (tile.type != Tile.Type.Ground) {
            tile = map.getRandomWalkableTile()
        }
        tile.type = Tile.Type.Stairs;

    }

    // set mid-room wall locations, scales with floor
    static trees(map, floor) {
        for (let i = 0; i < 50 - 2 * (floor - 1); i++) {
            let tile = map.getRandomWalkableTile();
            while (tile.type != Tile.Type.Ground || map.getNearTiles(tile).length < 8) {
                tile = map.getRandomWalkableTile()
            }
            tile.type = Tile.Type.Obstacle;
        }
    }

    // set enemy spawn locations, scales with floor
    static enemy(map, floor) {
        console.log(floor);
        for (let i = 0; i < 9 + 3 * (floor - 1); i++) {
            let tile = map.getRandomWalkableTile();
            while (tile.type != Tile.Type.Ground) {
                tile = map.getRandomWalkableTile()
            }
            tile.type = Tile.Type.EnemySpawn;
            switch (i % 3) {
                case 0: // bunny
                    tile.enemySpawnType = 0;
                    break;
                case 1: // wolf
                    tile.enemySpawnType = 1;
                    break;
                case 2: // cat
                    tile.enemySpawnType = 2;
                    break;
            }
        }
    }

    // sets bush locations
    static bush(map) {
        for (let i = 0; i < 100; i++) {
            let tile = map.getRandomWalkableTile();
            while (tile.type != Tile.Type.Ground) {
                tile = map.getRandomWalkableTile()
            }
            tile.type = Tile.Type.Bush;
        }
    }

    // set hole locations
    static hole(map) {
        for (let i = 0; i < 20; i++) {
            let tile = map.getRandomWalkableTile();
            while (tile.type != Tile.Type.Ground) {
                tile = map.getRandomWalkableTile()
            }
            tile.type = Tile.Type.Hole;
        }
    }

    // set bone locations, scales with floor
    static bone(map, floor) {
        for (let i = 0; i < 2 + 1 * (floor - 1) ; i++) {
            let tile = map.getRandomWalkableTile();
            while (tile.type != Tile.Type.Ground) {
                tile = map.getRandomWalkableTile()
            }
            tile.type = Tile.Type.BoneSpawn;
            tile.hasBone = true;
        }
    }

}