import * as THREE from 'three';
import { Entity } from './Entity.js';
import { DynamicEntity } from './DynamicEntity.js';

export class PlayerEntity extends DynamicEntity {

    constructor({
        textureMap,

        ...entityConfig
    } = {}) {
        
        super(entityConfig);

        this.hasBone = false; // if player has a bone
        this.bone; // references bone held by player

        // hides mesh since we aren't using meshes
        this.mesh = null;

        this.textureMap = textureMap;
        this.sprite = this.createSprite();

        this.noisy = false; // if making a noise
        this.hidden = false; // if hiding
        this.dead = false; // if contacts enemy
        this.isBark = false; // used for enemy state machines
        this.boneFatigue = 0; // used to prevent bones from being immediately picked up after placing/barking

    }

    // generates sprite
    createSprite() {
        let key = "player_idle";
        let material = new THREE.SpriteMaterial( 
            {map: this.textureMap.keyMap.get(key)}
        );
        let sprite = new THREE.Sprite(material);
        sprite.position.set(
            this.position.x,
            this.position.y+1,
            this.position.z
        );
        sprite.scale.set(2,2,2);
        sprite.renderOrder = 2;
        return sprite;
    }

    updateSprite() {
        let key
        if (this.velocity.x > 0) {
            if (this.hidden)  { key = "player_hide_n"; }
            else if (this.hasBone) { key = "player_bone_n"; }
            else              { key = "player_idle_n"; }

            let material = new THREE.SpriteMaterial( 
                {map: this.textureMap.keyMap.get(key)}
            );
            this.sprite.material = material;
        }
        else if (this.velocity.x <= 0) {
            if (this.hidden)  { key = "player_hide"; }
            else if (this.hasBone) { key = "player_bone"; }
            else              { key = "player_idle"; } 
        
            let material = new THREE.SpriteMaterial( 
                {map: this.textureMap.keyMap.get(key)}
            );
            this.sprite.material = material;
        }
    }

    update(deltaTime, map) {
        let dt = deltaTime;
        this.boneFatigue -= dt;
        
        let angle = this.sprite.material.rotation;

        if(this.acceleration.length() == 0 && this.velocity.length() > 0) {
            this.updateSprite();
        }

        // Set velocity
        this.velocity.set(
            this.acceleration.x, 
            this.acceleration.y, 
            this.acceleration.z
        );
    
        // Clamp velocity by top speed
        this.velocity.clampLength(0, this.topSpeed);

        if(this.acceleration.length() > 0) {
            this.updateSprite();
        }

        // Point in the direction of velocity
        if (this.velocity.length() > 0) {    
            let angle = Math.atan2(this.velocity.x, this.velocity.z);
            this.sprite.material.rotation = angle + Math.PI / 2 ;
        }
        else {
            this.sprite.material.rotation = angle;
        }
        
        // Update position by velocity
        this.position.addScaledVector(this.velocity, deltaTime);
    
        // Wrap our position so it does not exceed the level
        this.position = map.wrapPosition(this.position);
    
        // Handle collisions via entity's position
        this.position = map.handleCollisions(this);
    
        // Set the mesh position to our PlayerEntity position
        this.sprite.position.set(
                this.position.x,
                this.position.y+1,
                this.position.z
            );
    
        // Reset acceleration to 0 after applying forces
        this.acceleration.set(0,0,0);
      }
}