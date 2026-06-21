import * as THREE from 'three';

import { State } from './State.js';

import { SteeringBehaviours } from '../../steering/SteeringBehaviours.js';
import { CollisionModified } from '../../steering/CollisionModified.js';

import { Tile } from '../../../maps/Tile.js';

import { RoundEntity } from '../../../entities/RoundEntity.js';

// Nap State
// No Alert Status
// Does nothing
// can't see player (no raycast) but has a significantly larger
// radius for detecting player stepping on a noisy tile
export class NapState extends State {
    
    enter(entity, data) {
        entity.friction = 0.995;
        entity.sleeping = true;
        console.log("Entering Nap State");
    }

    update(entity, data, dt) {
        
        // if player barks, flee
        if (this.barkCheck(entity, data)) {
            return;
        }
        
        // if player makes sound nearby, investigate
        if (this.noisyCheck(entity, data)) { 
            entity.sleeping = false;
            return; 
        }

    }

    // checks if the player is nearby and making a noise (on a noisy tile)
    noisyCheck(entity, data) {
        let player = data.player;
        let map = data.map;
        if (player.noisy) {
            if (entity.position.distanceTo(player.position) <= 40) {
                entity.fsm.change(new InvestigateState());
                entity.target = map.quantize(player.position); 
                entity.alert = false;
                return true;
            }
        }
        else { return false; }
    }

    // checks if the player is nearby and barking
    barkCheck(entity, data) {
        let player = data.player;
        if (entity.position.distanceTo(player.position) <= 20 && player.isBark) {
            entity.fsm.change(new ScaredState());
            return true;
        }
        else { return false; }
    }

    exit(entity, data) {
        console.log("Leaving Nap State");
    }

}

// Investigate State
// Mixed Alert Status
// Investigate sound/last known player location
export class InvestigateState extends State {
    
    enter(entity, data) {
        entity.friction = 0.995;
        let pathfinder = data.pathfinder;
        let map = data.map;
        let player = data.player;

        let start = map.quantize(entity.position);
        let end = map.quantize(player.position);

        entity.path = pathfinder.findPath(start, end);
        console.log("Entering Investigate State");
    }

    update(entity, data, dt) {

        // if player barks, flee
        if (this.barkCheck(entity, data)) {
            return;
        }

        // if raycast collision detected, move to Chase State
        if (this.rayCheck(entity, data)) {
            entity.fsm.change(new ChaseState());
            return;
        }

        // if player makes sound nearby, investigate
        if (this.noisyCheck(entity, data)) { return; }
        
        // if reached end of path, change state
        if (entity.path.length == 0) {
            entity.fsm.change(new SearchState());
            return;
        }

        let map = data.map;
        let target = map.localize(entity.path[0]);

        // pathfinding
        if (entity.position.distanceTo(target) <= 1) {
            entity.path.shift();
            if (entity.path.length != 0) {
                target = map.localize(entity.path[0]);
            }   
        }
        
        // seek to next target on path
        let seekForce = SteeringBehaviours.seek(entity, target);
        entity.applyForce(seekForce);
    }

    // checks if the player is nearby and making a noise (on a noisy tile)
    noisyCheck(entity, data) {
        let player = data.player;
        let map = data.map;
        if (player.noisy && entity.target != map.quantize(player.position)) {
            if (entity.position.distanceTo(player.position) <= 40) {
                entity.fsm.change(new InvestigateState());
                entity.target = map.quantize(player.position); 
                return true;
            }
        }
        else { return false; }
    }

    // checks if the player is nearby and barking
    barkCheck(entity, data) {
        let player = data.player;
        if (entity.position.distanceTo(player.position) <= 20 && player.isBark) {
            entity.fsm.change(new ScaredState());
            return true;
        }
        else { return false; }
    }

    // Calls raycast to see if the enemy can see the player
    rayCheck(entity, data) {
        if (data.player.hidden) {return false};
        if (data.player.position.clone().sub(entity.position).length() <= 20){
            return entity.raycast(data.player, data.map);
        }
        return false;
    }


    exit(entity, data) {
        console.log("Leaving Investigate State");
    }

}

// Search State
// Mixed Alert State
// Looks around area after arriving
export class SearchState extends State {
    
    enter(entity, data) {
        entity.friction = 1;
        if (entity.alert) { entity.restTimer = 20; }
        else { entity.restTimer = 10; }
        console.log("Entering Search State");
    }

    update(entity, data, dt) {
        entity.restTimer -= dt;

        // if player barks, flee
        if (this.barkCheck(entity, data)) {
            return;
        }

        // if raycast collision detected, move to Chase State
        if (this.rayCheck(entity, data)) {
            entity.fsm.change(new ChaseState());
            return;
        }

        // if player makes sound nearby, investigate
        if (this.noisyCheck(entity, data)) { return; }

        // if timer runs out, return to default state
        // and remove alert status
        if (entity.restTimer <= 0) {
            entity.fsm.change(new NapState());
            entity.alert = false;
            return;
        }

        // Wander Steering Behaviour
        let steer = new THREE.Vector3();
        let wander = SteeringBehaviours.wander(entity, 5, 2, 0.3);
        steer.add(wander);

        let avoid = new THREE.Vector3();
        let avoidChange = new THREE.Vector3();

        let entities = data.entities;
        for (let e of entities) {
          if (e instanceof RoundEntity) {
              CollisionModified.unstuck(entity, e);
              avoid = CollisionModified.round(entity, e, 2, 2);
              if (avoid.length() > 0) {
                avoidChange = avoid.clone();
              }
          }
        }

        entity.resetDist();
        steer.add(avoidChange);
        entity.applyForce(steer);
    }

    // checks if the player is nearby and making a noise (on a noisy tile)
    noisyCheck(entity, data) {
        let player = data.player;
        let map = data.map;
        if (player.noisy) {
            if (entity.position.distanceTo(player.position) <= 40) {
                entity.fsm.change(new InvestigateState());
                entity.target = map.quantize(player.position);
                entity.alert = true;
                return true;
            }
        }
        else { return false; }
    }

    // checks if the player is nearby and barking
    barkCheck(entity, data) {
        let player = data.player;
        if (entity.position.distanceTo(player.position) <= 20 && player.isBark) {
            entity.fsm.change(new ScaredState());
            return true;
        }
        else { return false; }
    }

    // Calls raycast to see if the enemy can see the player
    rayCheck(entity, data) {
        if (data.player.hidden) {return false};
        if (data.player.position.clone().sub(entity.position).length() <= 20){
            return entity.raycast(data.player, data.map);
        }
        return false;
    }

    exit(entity, data) {
        console.log("Leaving Search State");
    }

}

// Chase State
// High Alert Status
// Pursues the player as long as they are in sight
export class ChaseState extends State {

    enter(entity, data) {
        entity.friction = 0.995;
        entity.alert = true;
        console.log("Entering Chase State");
    }

    update(entity, data, dt) {

        let map = data.map;
        let tile = map.quantize(entity.position);
        
        // If chasing and over puddle, change state to incapacitate
        if (tile.isPuddle) {
            entity.fsm.change(new IncapacitatedState());
            return;
        }

        // if player barks, flee
        if (this.barkCheck(entity, data)) {
            return;
        }

        // if no raycast collision detected, move to Investigate State
        if (!this.rayCheck(entity, data)) {
            entity.fsm.change(new InvestigateState());
            return;
        }

        // Pursue Steer Behaviour (targeting player)        
        let player = data.player;
        let steer = new THREE.Vector3();
        let pursue = SteeringBehaviours.pursue(entity, player, 2);
        steer.add(pursue);

        let avoid = new THREE.Vector3();
        let avoidChange = new THREE.Vector3();

        let entities = data.entities;
        for (let e of entities) {
          if (e instanceof RoundEntity) {
              CollisionModified.unstuck(entity, e);
              avoid = CollisionModified.round(entity, e, 2, 2);
              if (avoid.length() > 0) {
                avoidChange = avoid.clone();
              }
          }
        }

        entity.resetDist();
        steer.add(avoidChange);
        entity.applyForce(steer);
        
    }

    // checks if the player is nearby and barking
    barkCheck(entity, data) {
        let player = data.player;
        if (entity.position.distanceTo(player.position) <= 20 && player.isBark) {
            entity.fsm.change(new ScaredState());
            return true;
        }
        else { return false; }
    }

    // Calls raycast to see if the enemy can see the player
    rayCheck(entity, data) {
        if (data.player.hidden) {return false};
        if (data.player.position.clone().sub(entity.position).length() <= 20){
            return entity.raycast(data.player, data.map);
        }
        return false;
    }

    exit(entity, data) {
        console.log("Leaving Chase State");
    }

}

// Incapacitated State
// Sets player as asleep so they can no longer be interacted with
// end point state, cannot leave it, making the enemy "defeated" essentially
export class IncapacitatedState extends State {

    enter(entity, data) {
        entity.friction = 0.995;
        entity.setDead();
        console.log("Entering Incapacitated State");
    }

    update(entity, data, dt) {

    }

    exit(entity, data) {
        console.log("Leaving Incapacitated State");
    }

}

// Scared State
// If player barks within range, then flee for 10 seconds
// also sets them as asleep, so the player can freely interact with them
export class ScaredState extends State {

    enter(entity, data) {
        entity.friction = 1;
        entity.asleep = true;
        entity.restTimer = 10;
        console.log("Entering Scared State");
    }

    update(entity, data, dt) {

        entity.restTimer -= dt;
    
        // if timer runs out, go to Search State
        // and add alert status
        if (entity.restTimer <= 0) {
            entity.fsm.change(new SearchState());
            entity.alert = true;
            return;
        }

        // Flee Steering Behaviour
        let player = data.player;
        let steer = new THREE.Vector3();
        let flee = SteeringBehaviours.flee(entity, player);
        steer.add(flee);

        let avoid = new THREE.Vector3();
        let avoidChange = new THREE.Vector3();

        let entities = data.entities;
        for (let e of entities) {
          if (e instanceof RoundEntity) {
              CollisionModified.unstuck(entity, e);
              avoid = CollisionModified.round(entity, e, 2, 2);
              if (avoid.length() > 0) {
                avoidChange = avoid.clone();
              }
          }
        }

        entity.resetDist();
        steer.add(avoidChange);
        entity.applyForce(steer);

    }

    exit(entity, data) {
        console.log("Leaving Scared State");
    }

}

