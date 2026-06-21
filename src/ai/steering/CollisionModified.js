import * as THREE from 'three';
import { SteeringBehaviours } from './SteeringBehaviours.js';

// Modified Version of CollisionAvoidSteering from Assignment 2
// uses tiles instead of cylinders
// technically still circles that fully inclose the tiles but it visually works
// as intended (refactoring for cubes would've taken a lot more work than felt necessary)
export class CollisionModified {

  // Produces a steering behaviour to 
  // avoid a round obstacle
  static round(entity, obstacle, lookAhead, howFar, debug) {

    let steer = new THREE.Vector3();

    // First, get the future location of our character
    let predictedChange = entity.velocity.clone().multiplyScalar(lookAhead);
    let predictedLocation = entity.position.clone().add(predictedChange);

    // show via a line
    //debug.showLine("predictedLocation", entity.position, predictedLocation);

    // Get the closest point on the line segment from 
    // our entity --> it's predicted location
    // to the center of the round obstacle 
    let closestPoint = CollisionModified.getClosestPointOnSegment(
        entity.position,
        predictedLocation,
        obstacle.position
      );

    // Check to see if there is a collision
    let isCollisionC =
      closestPoint.distanceTo(obstacle.position) <= obstacle.radius;

    let collisionPoint = new THREE.Vector3();
    let target = new THREE.Vector3();

    if (isCollisionC) {
      // -NEW- if the obstacle is closer to the entity than the previously calculated closest collision,
      // then recalculate using this newly calculated collision
      if (obstacle.position.clone().sub(entity.position).length() < entity.cDist) {
          collisionPoint = CollisionModified.getLineCircleCollisionPoint(
            entity.position, 
            predictedLocation, 
            obstacle.position, 
            obstacle.radius
          );

        // Get the avoid target
        target = CollisionModified.getAvoidTarget(collisionPoint, obstacle, howFar);
        steer = SteeringBehaviours.seek(entity, target);
        
        // -NEW- saves the current calculated collision as the closest
        entity.cDist = obstacle.position.clone().sub(entity.position).length()
        entity.cLoc = steer.clone();
      }
      
      // -NEW- if the detected collision is further than the previously recorded
      // closest collision, then reuse that previous collision, allowing us to 
      // skip having to recalculate the steer every time for the closest found
      // collision
      else {
        steer = entity.cLoc.clone();
      }

    }

    // -NEW- if no collision is detected, it will simply reuse the closest detected collision
    // value. Since the initial value is 0, if no collisions have been detected so far,
    // then it will still be [0,0,0], resulting in no impact on the steer value
    else {
      steer = entity.cLoc.clone();
    }

    // -NEW- sum the steer vectors of the central ray and the two whiskers
    // to give us a final steer value
    // like the base original function, these will just output a [0,0,0] vector
    // and have no impact on steer if they do not detect a collision
    steer.add(this.whiskerL(entity, obstacle, lookAhead, howFar, debug));
    steer.add(this.whiskerR(entity, obstacle, lookAhead, howFar, debug));
    return steer;
  }

  // -NEW- for calculating the steering behaviour with the left whisker
  static whiskerL(entity, obstacle, lookAhead, howFar, debug) {
    let steer = new THREE.Vector3();

    // -NEW- First, get the endpoint for the whisker
    let predictedChange = entity.velocity.clone().multiplyScalar(lookAhead);
    let whiskerChange = predictedChange.clone().applyAxisAngle(
      new THREE.Vector3(0,1,0), 
      Math.PI/6
    ).setLength(2);
    let whiskerLocation = entity.position.clone().add(whiskerChange);

    // show via a line
    //debug.showLine("WhiskerL", entity.position, whiskerLocation);

    // Get the closest point on the line segment from 
    // our entity --> it's whisker endpoint
    // to the center of the round obstacle 
    let closestPoint = CollisionModified.getClosestPointOnSegment(
        entity.position,
        whiskerLocation,
        obstacle.position
      );

    // Check to see if there is a collision
    let isCollisionL =
      closestPoint.distanceTo(obstacle.position) <= obstacle.radius;

    let collisionPoint = new THREE.Vector3();
    let target = new THREE.Vector3();

    if (isCollisionL) {
      // -NEW- if the obstacle is closer to the entity than the previously calculated closest collision,
      // then recalculate using this newly calculated collision
      if (obstacle.position.clone().sub(entity.position).length() < entity.cDist) {
          collisionPoint = CollisionModified.getLineCircleCollisionPoint(
            entity.position, 
            whiskerLocation, 
            obstacle.position, 
            obstacle.radius
          );

        // Get the avoid target
        target = CollisionModified.getAvoidTarget(collisionPoint, obstacle, howFar);
        steer = SteeringBehaviours.seek(entity, target);
        
        // -NEW- saves the current calculated collision as the closest
        entity.lDist = obstacle.position.clone().sub(entity.position).length()
        entity.lLoc = steer.clone();
      }
      
      // -NEW- if the detected collision is further than the previously recorded
      // closest collision, then reuse that previous collision, allowing us to 
      // skip having to recalculate the steer every time for the closest found
      // collision
      else {
        steer = entity.lLoc.clone();
      }

    }

    // -NEW- if no collision is detected, it will simply reuse the closest detected collision
    // value. Since the initial value is 0, if no collisions have been detected so far,
    // then it will still be [0,0,0], resulting in no impact on the steer value
    else {
      steer = entity.lLoc.clone();
    }

    return steer;
  }

  // -NEW- for calculating the steering behaviour with the right whisker 
  static whiskerR(entity, obstacle, lookAhead, howFar, debug) {
    let steer = new THREE.Vector3();

    // -NEW- First, get the endpoint for the whisker
    let predictedChange = entity.velocity.clone().multiplyScalar(lookAhead);
    let whiskerChange = predictedChange.clone().applyAxisAngle(
      new THREE.Vector3(0,1,0), 
      -Math.PI/6
    ).setLength(2);
    let whiskerLocation = entity.position.clone().add(whiskerChange);

    // show via a line
    //debug.showLine("WhiskerR", entity.position, whiskerLocation);

    // Get the closest point on the line segment from 
    // our entity --> it's whisker endpoint
    // to the center of the round obstacle 
    let closestPoint = CollisionModified.getClosestPointOnSegment(
        entity.position,
        whiskerLocation,
        obstacle.position
      );

    // Check to see if there is a collision
    let isCollisionR =
      closestPoint.distanceTo(obstacle.position) <= obstacle.radius;

    let collisionPoint = new THREE.Vector3();
    let target = new THREE.Vector3();

    if (isCollisionR) {
      // -NEW- if the obstacle is closer to the entity than the previously calculated closest collision,
      // then recalculate using this newly calculated collision
      if (obstacle.position.clone().sub(entity.position).length() < entity.cDist) {
          collisionPoint = CollisionModified.getLineCircleCollisionPoint(
            entity.position, 
            whiskerLocation, 
            obstacle.position, 
            obstacle.radius
          );

        // Get the avoid target
        target = CollisionModified.getAvoidTarget(collisionPoint, obstacle, howFar);
        steer = SteeringBehaviours.seek(entity, target);
        
        // -NEW- saves the current calculated collision as the closest
        entity.rDist = obstacle.position.clone().sub(entity.position).length()
        entity.rLoc = steer.clone();
      }
      
      // -NEW- if the detected collision is further than the previously recorded
      // closest collision, then reuse that previous collision, allowing us to 
      // skip having to recalculate the steer every time for the closest found
      // collision
      else {
        steer = entity.rLoc.clone();
      }

    }

    // -NEW- if no collision is detected, it will simply reuse the closest detected collision
    // value. Since the initial value is 0, if no collisions have been detected so far,
    // then it will still be [0,0,0], resulting in no impact on the steer value
    else {
      steer = entity.rLoc.clone();
    }

    return steer;
  }

  // Get the avoid target
  static getAvoidTarget(collisionPoint, obstacle, howFar) {

    let normal = collisionPoint.clone().sub(obstacle.position);
    normal.setLength(howFar);

    let target = collisionPoint.clone().add(normal);

    return target;
  }

  // Get the closest point on the line
  // to the center of the obstacle
  static getClosestPointOnSegment(start, end, point) {
    let segment = end.clone().sub(start);
    let toPoint = point.clone().sub(start);

    let sp = toPoint.dot(segment)/segment.length();

    let clampedSP = THREE.MathUtils.clamp(sp, 0, segment.length());

    let closest = segment.clone().setLength(clampedSP);
    closest.add(start);

    return closest;
  }

  // Get the collision point between
  // a line and a circle
  static getLineCircleCollisionPoint(start, end, circlePos, radius) {

    let line = end.clone().sub(start);

    let toCircle = circlePos.clone().sub(start);
    let sp = toCircle.dot(line)/line.length();

    // Point on line closest to center
    let projectionPoint = line.clone().setLength(sp);
    projectionPoint.add(start);

    let opposite = projectionPoint.clone().sub(circlePos);
    let adjacent = Math.sqrt(radius * radius - opposite.length() ** 2);

    let collisionLength = sp - adjacent;

    let collisionPoint = line.clone().setLength(collisionLength);
    collisionPoint.add(start);

    return collisionPoint;
  }

  // -NEW- basic Collision detection
  // essentially, if the entity ends up inside an obstacle
  // places the object at the nearest point outside the obstacle and sets its
  // direction of movement directly away from the obstacle, while conserving it's speed
  // basic solution but it works
  // probably should be it's own class but fits well enough here and is very simple
  static unstuck(entity, obstacle) {
    
    let dist = entity.position.clone().sub(obstacle.position);
    if (dist.length() <= obstacle.radius) {
      let displacement = dist.setLength(obstacle.radius + 0.01);
      entity.position = obstacle.position.clone().add(displacement);
      let speed = entity.velocity.length();
      let velocity = displacement.clone().setLength(speed);
      entity.velocity = velocity.clone();
    }
    return
  }


}