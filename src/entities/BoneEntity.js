import * as THREE from 'three';
import { Entity } from './Entity.js';
import { DynamicEntity } from './DynamicEntity.js';
import { Tile } from "../maps/Tile.js";

export class BoneEntity extends DynamicEntity {

    constructor({
        textureMap,
        zLevel = 1,

        ...entityConfig
    } = {}) {

        super(entityConfig);

        this.textureMap = textureMap; // stores array of all textures
        this.zLevel = zLevel; // used to prevent clipping
        this.sprite = this.createSprite(); // creates sprite for entity

        // hides mesh since we aren't using meshes
        this.mesh = null;

    }

    // generates sprite
    createSprite() {
        let key = "bone"
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

    update(deltaTime, map) {
        // Set the sprite position to our BoneEntity position
        this.sprite.position.set(
            this.position.x,
            this.position.y + this.zLevel,
            this.position.z
        );
    }

    // changes whether or not bone is visible
    changeVisibility() {
        this.sprite.visible = !this.sprite.visible;
    }

}