import * as THREE from 'three';
import { Tile } from '../maps/Tile';

export class SpriteMapRenderer {

    constructor(tileMap, textures, scene) {
        this.map = tileMap;
        this.sprites = textures;
        this.textureKey;
        for (let r = 0; r < this.map.rows; r++) {
            for (let c = 0; c < this.map.cols; c++) {
                let tile = this.map.grid[r][c];
                switch (tile.type) {
                    case Tile.Type.Ground:
                        this.textureKey = this.pickGround(0.05, tile);
                        break;
                    case Tile.Type.Obstacle:
                        this.textureKey = this.map.getExtraNeighbours(tile).toString();
                        if (this.textureKey != "1111") {
                            tile.isEdge = true;
                        } 
                        break;
                    case Tile.Type.PlayerSpawn:
                        this.textureKey = "mushroom";
                        break;
                    case Tile.Type.EnemySpawn:
                        this.textureKey = "mushroom";
                        break;
                    case Tile.Type.Stairs:
                        this.textureKey = "stairs";
                        break;
                    case Tile.Type.Hole:
                        this.textureKey = "hole";
                        break;
                    case Tile.Type.Bush:
                        this.textureKey = "bush";
                        break;
                    default:
                        this.textureKey = "mushroom";
                        break;
                }
                let material = new THREE.SpriteMaterial( {map: textures.keyMap.get(this.textureKey)});
                let sprite = new THREE.Sprite(material);
                sprite.position.set(
                    this.map.localize(tile).x,
                    this.map.localize(tile).y,
                    this.map.localize(tile).z,
                );
                
                sprite.scale.set(2,2,2);
                sprite.renderOrder = 0;
                scene.add(sprite);
                
            }
        }
    }

    pickGround(chance, tile) {
        let roll = Math.random();
        if  (roll > 1-chance)   {
            tile.noisy = true;
            return  "grass";
        }
        else if (roll < chance) {
            tile.noisy = true;
            tile.isPuddle = true;
            return "puddle";  
        }
        else { return "ground";  }
    }
}