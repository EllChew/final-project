import * as THREE from 'three';
import { Entity } from './Entity.js';
import { DynamicEntity } from './DynamicEntity.js';
import { Tile } from "../maps/Tile.js";

export class EnemyEntity extends DynamicEntity {

    constructor({
        enemyType = 0,
        textureMap,
        zLevel = 1,
  
        ...entityConfig
    } = {}) {

        super(entityConfig);
        
        this.enemyType = enemyType; // stores type of enemy instance is
        this.textureMap = textureMap; // stores array of all textures
        this.zLevel = zLevel; // used to prevent
        this.sprite = this.createSprite(); // creates sprite for entity
        
        // hides mesh since we aren't using meshes
        this.mesh = null;

        this.path = []; //stores individual pathfinder path
        this.fsm;       //stores individual state machine
        this.restTimer; //stores restTimer for state usage
        this.target; //stores tile to travel to for certain state transitions
        this.alert = false; // stores if the enemy is alerted to the player's presence. Alters certain behaviours
        this.sleeping = false; // stores if an enemy is sleeping or otherwise incapacitated.

        // used for Collision Avoidance
        this.cDist = Math.min();
        this.cLoc = new THREE.Vector3(0,0,0);
        this.lDist = Math.min();
        this.lLoc = new THREE.Vector3(0,0,0);
        this.rDist = Math.min();
        this.rLoc = new THREE.Vector3(0,0,0);
        
    }

    // generates sprite
    createSprite() {
        let key;
        if (this.enemyType == 0) { key = "bunny_idle"; }
        else if (this.enemyType == 1) { key = "wolf_idle"; }
        else if (this.enemyType == 2) { key = "cat_idle"}
        let material = new THREE.SpriteMaterial( 
            {map: this.textureMap.keyMap.get(key)}
        );
        let sprite = new THREE.Sprite(material);
        sprite.position.set(
            this.position.x,
            this.position.y + this.zLevel,
            this.position.z
        );
        sprite.scale.set(2,2,2);
        sprite.renderOrder = 3;
        return sprite;
    }

    resetDist() {
        this.cDist = Math.min();
        this.cLoc = new THREE.Vector3(0,0,0);
        this.lDist = Math.min();
        this.lLoc = new THREE.Vector3(0,0,0);
        this.rDist = Math.min();
        this.rLoc = new THREE.Vector3(0,0,0);
    }

    update(deltaTime, map) {
    
        // Apply friction
        this.velocity.multiplyScalar(this.friction);

        // Update our velocity by acceleration
        this.velocity.addScaledVector(this.acceleration, deltaTime);

        // Clamp velocity by top speed
        this.velocity.clampLength(0, this.topSpeed);

        // adjust sprite for flipped orientation (so it doesn't go upside-down)
        if (this.velocity.x > 0 && !this.sleeping) {
            let key;
            if (this.enemyType == 0) { key = "bunny_idle_n"; }
            else if (this.enemyType == 1) { key = "wolf_idle_n"; }
            else if (this.enemyType == 2) { key = "cat_idle_n"; }
            
            let material = new THREE.SpriteMaterial( 
                {map: this.textureMap.keyMap.get(key)}
            );
            this.sprite.material = material;
        }
        else if (this.velocity.x < 0 && !this.sleeping) {
            let key;
            if (this.enemyType == 0) { key = "bunny_idle"; }
            else if (this.enemyType == 1) { key = "wolf_idle"; }
            else if (this.enemyType == 2) { key = "cat_idle"; }

            let material = new THREE.SpriteMaterial( 
                {map: this.textureMap.keyMap.get(key)}
            );
            this.sprite.material = material;
        }

        // Point in the direction of velocity
        if (this.velocity.length() != 0) {
            let angle = Math.atan2(this.velocity.x, this.velocity.z);
            this.sprite.material.rotation = angle + Math.PI / 2 ;
        }
        
        // Update position by velocity
        this.position.addScaledVector(this.velocity, deltaTime);

        // Wrap our position so it does not exceed the level
        this.position = map.wrapPosition(this.position);

        if (this.friction == 0.995) {
            let pos = map.handleCollisions(this);
        }
        // Handle collisions via entity's position

        // Set the sprite position to our EnemyEntity position
        this.sprite.position.set(
                this.position.x,
                this.position.y + this.zLevel,
                this.position.z
        );

        // Reset acceleration to 0 after applying forces
        this.acceleration.set(0,0,0);
    }

    // raycasting check to see if the enemy can see the player
    raycast(player, map) {
        let dir = player.position.clone().sub(this.position);
        dir.y = 0;
        let position = new THREE.Vector3(
            this.position.x,
            0,
            this.position.z,
        );
        let ray = new THREE.Raycaster(
            position,
            dir.clone().normalize(),
            0,
            dir.length()
        )

        // Iterates through tiles
        // if a Tile is closer than the player, and is 
        // a bush or wall, and intersects the line between
        // the player and the enemy, then return false
        // if no intersects found, return true
        for (let r = 0; r < map.rows; r++) {
            for (let c = 0; c < map.cols; c++) {
                let tile = map.grid[r][c];
                let dist = map.localize(tile).sub(this.position).length();
                if (dist < dir.length()) {
                    if (tile.type == Tile.Type.Obstacle || tile.type == Tile.Type.Bush) {
                        let pos = map.localize(tile);
                        let box = new THREE.Mesh(
                            new THREE.BoxGeometry(2, 2, 2),
                            new THREE.MeshStandardMaterial({ color: 'blue', side: THREE.DoubleSide })
                        )
                        box.position.copy(pos)
                        box.updateMatrixWorld(true);
                        let intersect = ray.intersectObject(box);
                        if (intersect.length > 0) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    // sets enemy to dead and changes sprite to show it incapacitated
    setDead() {

        this.sleeping = true;
        
        let key;
        if (this.enemyType == 0) { key = "bunny_dead"; }
        else if (this.enemyType == 1) { key = "wolf_dead"; }
        else if (this.enemyType == 2) { key = "cat_dead"; }
        
        let material = new THREE.SpriteMaterial( 
            {map: this.textureMap.keyMap.get(key)}
        );
        this.sprite.material = material;

        return;

    }

}