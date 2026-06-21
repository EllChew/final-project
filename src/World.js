import * as THREE from 'three';
import * as Setup from './setup.js';

import { DebugVisuals } from './debug/DebugVisuals.js';
import { InputHandler } from './input/InputHandler.js';

import { Tile } from './maps/Tile.js';
import { TileMap } from './maps/TileMap.js';

import { TileMapRenderer } from './renderers/TileMapRenderer.js';
import { TextureLoader } from './renderers/TextureLoader.js';
import { SpriteMapRenderer } from './renderers/SpriteMapRenderer.js';

import { PlayerEntity } from './entities/PlayerEntity.js';
import { EnemyEntity } from './entities/EnemyEntity.js';
import { BoneEntity } from './entities/BoneEntity.js';
import { RoundEntity } from './entities/RoundEntity.js';

import {StateMachine} from "./ai/decisions/state-machines/StateMachine.js";
import {ForageState} from "./ai/decisions/state-machines/BunnyState.js";
import {TravelState} from "./ai/decisions/state-machines/WolfState.js";
import {NapState} from "./ai/decisions/state-machines/CatState.js";

import { SteeringBehaviours } from './ai/steering/SteeringBehaviours.js';
import { CollisionModified } from './ai/steering/CollisionModified.js';

import { AStar } from './ai/pathfinding/AStar.js';
import { JPS } from './ai/pathfinding/JPS.js';



/**
 * World class holds all information about our game's world
 */
export class World {

  // Creates a world instance
  constructor() {
    this.scene = Setup.createScene();
    this.camera = Setup.createCamera();
    this.renderer = Setup.createRenderer();

    this.debug = new DebugVisuals(this.scene);

    this.clock = new THREE.Clock();

    this.inputHandler = new InputHandler(this.camera);

    this.entities = [];

    this.player;

    // Tracks the current floor
    this.floor = 1;

    // used to tell if the scene should be regenerated (on new floor/defeat)
    this.isSceneChange = false;

  }

  // Initialize objects in our world
  init() {
   
    this.map = new TileMap(2);    

    Setup.createLight(this.scene);
    Setup.showHelpers(this.scene, this.camera, this.renderer, this.map);

    this.textures = new TextureLoader;
    
    this.spriteMapRenderer = new SpriteMapRenderer(this.map, this.textures, this.scene);
    this.map.getEdges();
    
    this.zLevel = 2
    this.spawnEntities()

    this.pathfinder = new JPS(this.map, AStar.manhattan);

    this.spawnCollision();

    this.addFSM();
    
  }

  // generates a new level after reaching a new floor
  levelReInit() {

    this.floor += 1;

    this.scene = Setup.createScene();

    this.debug = new DebugVisuals(this.scene);

    this.map = new TileMap(2, this.floor);    

    this.inputHandler = new InputHandler(this.camera);

    this.entities = [];

    Setup.createLight(this.scene);
    Setup.showHelpers(this.scene, this.camera, this.renderer, this.map);

    this.spriteMapRenderer = new SpriteMapRenderer(this.map, this.textures, this.scene);
    this.map.getEdges();

    // used for avoid sprites clipping
    this.zLevel = 2;
    this.spawnEntities()

    this.pathfinder = new JPS(this.map, AStar.manhattan);

    this.spawnCollision();

    this.addFSM();
  }

  // generates invisible entities for collision detection
  spawnCollision() {
    for (let r = 0; r < this.map.rows; r++) {
      for (let c = 0; c < this.map.cols; c++) {
        if (this.map.grid[r][c].type == Tile.Type.Obstacle) {
          let obstacle = new RoundEntity({
          radius: 1.5,
          position: this.map.localize(this.map.grid[r][c]),
          height: 1,
        }); 
        this.addMeshlessToWorld(obstacle);
        }
      }
    }
  }
  
  // generates all dynamic entities to scene based on dungeon generation/population
  spawnEntities() {
    let tiles = this.map.walkableTiles;
    for (let t of tiles) {
      let entity;
      switch (t.type) {
        case Tile.Type.PlayerSpawn:
          this.player = this.makePlayer(t);
          this.addSpriteToWorld(this.player);
          break;
        case Tile.Type.EnemySpawn:
          entity = this.makeEnemy(t);
          this.addSpriteToWorld(entity);
          break;
        case Tile.Type.BoneSpawn:
          entity = this.makeBone(t);
          this.addSpriteToWorld(entity);
          break;
      }
    }
  }

  // generates player entity
  makePlayer(tile) {
    let entity = new PlayerEntity({
      position: this.map.localize(tile),
      textureMap: this.textures,
    })
    return entity;
  }

  // generates enemy entity
  makeEnemy(tile) {
    let entity = new EnemyEntity({
      position: this.map.localize(tile),
      enemyType: tile.enemySpawnType,
      textureMap: this.textures,
      zLevel: this.zLevel,
    })
    this.zLevel += 1;
    return entity;
  }

  // generates bone entity
  makeBone(tile) {
    let entity = new BoneEntity({
      position: this.map.localize(tile),
      textureMap: this.textures,
      zLevel: this.zLevel,
    })
    this.zLevel += 1;
    tile.bone = entity;
    return entity;
  }

  // adds an appropriate state machine to each enemy
  addFSM() {
    for (let e of this.entities) {
      if (e instanceof EnemyEntity) {
        if (e.enemyType == 0) {
          e.fsm = new StateMachine(e, new ForageState(), {
            entities: this.entities,
            pathfinder: this.pathfinder,
            map: this.map,
            player: this.player,
          });
        }

        if (e.enemyType == 1) {
          e.fsm = new StateMachine(e, new TravelState(), {
            entities: this.entities,
            pathfinder: this.pathfinder,
            map: this.map,
            player: this.player,
          });
        }

        if (e.enemyType == 2) {
          e.fsm = new StateMachine(e, new NapState(), {
            entities: this.entities,
            pathfinder: this.pathfinder,
            map: this.map,
            player: this.player,
          });
        }
        
      }
    }
  }

  // Add an entity to the world
  addEntityToWorld(entity) {
    this.scene.add(entity.mesh);
    //this.scene.add(entity.sprite);
    this.entities.push(entity);
  }

  // Adds an invisible entity to the world
  addMeshlessToWorld(entity) {
    this.entities.push(entity);
  }

  // Adds an entity that uses a Sprite instead of a Mesh to the world
  addSpriteToWorld(entity) {
    this.scene.add(entity.sprite);
    this.entities.push(entity);
  }

  // Update our world
  update() {

    if (this.isSceneChange) {
      this.levelReInit();
    }

    let dt = this.clock.getDelta();

    // Sets the camera to face and track the player, keeping correct orientation
    this.camera.position.x = this.player.position.x;
    this.camera.position.z = this.player.position.z + 0.01;
    this.camera.lookAt(this.player.position);

    // player-relevant checks, largely to do with player input
    // called here since we don't use FSM for player
    this.player.isBark = false;
    this.boneCheck();
    this.barkCheck();
    this.dropBone();
    this.isNoisy();
    this.isHidden();

    if (!this.player.hidden) {
      let steer = this.inputHandler.getForce(10);
      this.player.applyForce(steer);
    }

    for (let e of this.entities) {
      
      if (e instanceof EnemyEntity) {
        e.fsm.update(dt);
        
        // If player contacts an NPC that isn't sleeping/incapacitated
        // or if player contacts cat while in a hole
        // or if player contacts bunny in a bush
        // set player as dead
        if (!this.player.hidden) {
          if(this.map.quantize(this.player.position) == this.map.quantize(e.position)) {
            // if sleeping
            if (!e.sleeping) {
              this.player.dead = true;
            }

          }
        }
      }

      if (e.update)
        e.update(dt, this.map);
    }

    // If the player is on top of the stairs tile, generate a new stage
    this.isSceneChange = this.map.quantize(this.player.position).type == Tile.Type.Stairs;

    if (this.player.dead) {
      this.floor = 0;
      this.isSceneChange = true;
    }
    
  }

  // Render our world
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // checks if player is on a noisy tile
  isNoisy() {
    let tile = this.map.quantize(this.player.position);
    if (tile.noisy) {
      this.player.noisy = true;
    }
    else {
      this.player.noisy = false;
    }
  }

  // Checks if player is on a tile you can hide on AND is pressing the hide button (i)
  isHidden() {
    let tile = this.map.quantize(this.player.position);
    if (tile.type == Tile.Type.Hole || tile.type == Tile.Type.Bush) {
      if (this.inputHandler.getHide()) { this.player.hidden = true; }
      else { this.player.hidden = false; }
    }
    else { this.player.hidden = false; }
  }

  // if the player does not have a bone and is on a tile with a bone
  // mark the bone as having been picked up, and mark the player as
  // having a bone
  boneCheck() {
    let tile = this.map.quantize(this.player.position);
    if (tile.hasBone && !this.player.hasBone && this.player.boneFatigue <= 0) {
      this.player.bone = tile.bone;
      this.player.hasBone = true;
      this.player.bone.changeVisibility();
    }
  }

  // Checks if the bark button (O) is being pressed
  // and if the player has a bone to consume
  // if so, mark bark as true and remove bone from player
  // and add fatigue
  barkCheck() {
    if (this.player.hasBone && this.inputHandler.getBark()) {
      this.player.hasBone = false;
      this.player.isBark = true;
      this.player.boneFatigue = 5;
    }
  }

  // Checks if the drop bone button (P) is being pressed
  // and if the player has a bone to consume
  // if so, move bone to player location, make visible, remove bone from player
  // and add fatigue
  dropBone() {
    let tile = this.map.quantize(this.player.position);
    if (this.player.hasBone && this.inputHandler.getDrop()) {
      if (!tile.hasBone) {
        tile.bone = this.player.bone;
        tile.hasBone = true;
        this.player.hasBone = false;
        tile.bone.changeVisibility();
        tile.bone.position = this.player.position.clone();
        this.player.boneFatigue = 5;
        
      }
      
    }
  }

}