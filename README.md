# Final Project

## Base Concept
- Game is about a very scared puppy dog trying to find its friends in the woods
- It's very afraid so if ends up meeting any animals, it dies
- Essentially a stealth game (albeit not exactly traditonal)

## Controls

- WASD keys are used for general movement

- If the player passes over a bone, they will pick it up (demonstrated by a sprite change), assuming they don't already have one

- While holding a bone, the player can press the 'o' key to bark, scaring away bunnies and cats (but not wolves)

- the player can also press the 'p' key to drop any bone they have, placing it on the ground (assuming there isn't a bone on that tile already). 

The use of this will be explained later

- If the player is on top of a hole or a bush, they can press the 'i' key to hide

while hiding, the player cannot move, but enemies cannot see them and overlapping with them will not cause a game restart

## World

- The worldspace is a procedurally generated dungeon based on the algorithm shown in class. In addition to that as a baseline, it also is modified to add additonal hallways to look like "tree-like" and more natural, joining a semi-random amount of unconnected rooms.
- After the initial dungeon layout generation, further generation is done to populate it
- Spawn points for the player, enemies, and bone (explained later) entities are randomly populated through the level
- Multiple differentiated tiles will also be placed randomly through the level with different traits, which include additional walls inside rooms as obstacles, bushes and holes, puddles, and tuffs of grass
- A single staircase is also placed at random somewhere in the level. If the player moves over this, they will move to the "Next floor", causing more enemies to spawn than before and less walls to spawn (making it harder to evade enemies since they will see the player more easily)

## Tiles

Bushes
- They can be used by the player to hide, and also block the line of sight of enemies, making it harder for them to spot the player

Puddles
- If the player walks over these, they will make a noise, alerting nearby enemies. 
- If the player is being chased by a Cat enemy, and it passes over a puddle it will cause it to be "defeated" (its fur puffs up).
- Does not block line of sight.

Hole
- They can be used by the player to hide, but do not obstruct the line of sight of enemies, so if the player exits, they'll be immediately visible to enemies. 
- If the player is being chased by a Bunny enemy, and it passes over a hole it will cause it to be "defeated" (its fall in the hole and is too small to get out)

Trees/Walls
- Obstacle tiles as used in assignments
- Will block line of sight of enemies, and block movement

Grass
- If the player passes over grass, it will make a noise, alerting nearby enemies.
- unlike puddles, cannot be used to defeat any kinds of enemies
- Does not block line of sight

Ground
- regular tiles with no unique visual or mechanical properties

Spawn Tiles
- Marked by mushrooms, these tiles are used to add more visual variety to the level, and were also used early on for debugging, as they show the original spawn points of entities

Stairs
- its Stairs
- Interact with it to go to next floor, this causes the entire level to be re-generated with slightly altered parameters

## Entities

General
- To prevent clipping, RenderOrder and the Y coordinate are both used in tandem. Since the Camera is fixed and is in Orthographic view, changing the Y Coordinate doesn't affect the way a sprite renders

Player
- Already discussed largely in controls
- Has multiple sprites it uses based on circumstances (regular, if it has a bone, or if its hiding)

Enemies
- represented visually as bunnies, wolves, and cats, there are 3 different types of enemy
- they each share a set of universal behaviours, but also have their own unique behaviour states and differences between some common behaviour states
- Generic States include
- Investigate: If the enemy hears the player making a noise (player steps on noise tile within vicinity), or the player just left their line of sight, they will use Jump Point Search to navigate towards the player location at the time of the state change. Can transition to Chase or Search States
- Search: entered after Investigate arrives at the last known location, or after the enemy leaves the Scared State. Sets a timer and then wanders around for 10 or 20 seconds, depending on the alert state of the enemy, implied to be them "searching" for the player/source of the noise depending on previous states. Can transition to Chase or Investigate States, or Enemy-specific States. If it transitions to Investigate, they will be set to high alert (alert = true). Uses Wander steering behaviour and Collision Avoidance.
- Chase: If in most states, the player is within a short distance of the enemy and a ray casted from the enemy to the player experience 0 collisions, then they will be put into Chase and start chasing after the player. The will be set to high alert, and as long as the raycast shows no collisions, it use the Pursue steering behaviour to chase after the player combined with Collision Avoidance (using a slightly modified version of the whisker behaviour from Assignment 2). If the raycast detects a collision, the player is treated as being "out of sight", and the State Machine will transition to  Search (with Alert already set). Each enemy type also has a unique condition where the player can "defeat" them, causing their sprite to change and them to no longer move or be dangerous to the player, transitioning them to the Incapacitated State
- Incapacitated: The enemy stops moving and has its sprite change. It cannot leave this state, and the player will not longer have the game restart if they come into contact with it. Different appearance for each enemy type.
- Scared: Only used by 2/3 Enemy types. If the player has a bone and consumes it to Bark, nearby enemies of the Bunny or Cat type (0 and 2) will be moved into this state regardless of their current state (except Incapacitated). This will cause them to use the Flee steering behaviour (with Collision Avoidance) to try and get away from the player. Does not work on wolves because a wolf would likely not be scared by a dog barking.

Bunnies
- First enemy type
- Unique States are Forage and Feed.
- Forage uses Jump Point Search to navigate to a random Bush tile on the map, implied to be it foraging for food
- Feed has it wait at that Bush tile navigated to in Forage for 5 seconds, implied to be it "eating".
- Will repeat this infinitely until it either spots or hears the player, or if they hear a bark
- Defeated in Chase state by being lead over a Hole tile, which will cause it to "fall in" setting it to incapacitated and changing its sprite. Has a unique behaviour in Incapacitated to set its position more central to the tile to look better/actually sit in the Hole.

Wolves
- Second Enemy type
- Unique States are Travel and Wander
- Travel picks a random tile on the map to navigate to using Jump Point Search, then Wander will cause it to Wander around for 10 seconds before finding a new Tile to travel to
- Uniquely unaffected by Barking, and is not incapacitated by a tile, but is instead the use of being able to place picked up bones instead
- If a Wolf is chasing the player, and comes into contact with a Bone entity (whether naturally spawned or dropped by the player), it will be incapacitated (its starts chewing on the bone), represented by a sprite and state change.
- Harder to incapacitate since Bones are less common and it can't be Scared, but the portability of Bones is intended to balance this out.

Cats
- Third enemy type
- Unique State is Nap
- In Nap it does nothing, because its Napping. It uniquely can NOT see the player if it is in the Nap state.
- To make up for this, Cat entities can detect Noise at double the range of Wolves and Bunnies, causing them to move to Investigate if a sound is 20 tiles away rather than only 10
- Can still see the player with Raycasting in other states
- Can be scared like Bunnies by Barking
- If while Chasing the player, they are lead over a Puddle tile, it will incapacitate it (by "causing its fur to puff up").

Bones
- Third entity type
- Picked up to be used by the player or defeat case for Wolves
- Does nothing on its own
- Visibility is modified when its picked up/consumed, rather than spawning/deleting entities (faster)
- mainly impacted through several functions called early on in World's update()

## Changes
- Modified files include World, InputHandler, and DungeonGenerator.
- Additional Functions added to the end of InputHandler and DungeonGenerator, with slight code changes done to accomodatet them. World has extremely large number of additions that it would be difficult to define each original and changed part, though it was largely built off the main simple skeleton used in class and assignments. dungeon-generation-source was used as the starting point so that should make it easier.
- Most notable additional with World however is the ability to reinitialize the stage, with a slightly modified version of the init function called if the player is defeated or reaches a new floor to generate a new level. this.floor is main parameters that affects difficulty as floor increases, and it resets on "Death" rather than being incremented.
- Setup also slightly modified to remove camera controls and change the Camera to Orthographic view
- Tile also has some additional Types added, as well as some variables to cover for Enemy Spawning and Bone functionality
- TileMap has an additional function that is modified from GetNeighbours to make sure any Wall tile uses the visually correct Texture, and a another function made to prevent Obstacles from being spawned in a way that cuts off access to areas.
- Sprites in general are used in favor of Meshes

## Additions
- State Machines were added for each enemy type, being CatState, BunnyState, and WolfState
- SpriteMapRenderer is an entirely new function that functions similar to TileMapRenderer but made to render using Sprites instead
- EnemyEntity, PlayerEntity, and BoneEntity are modified version of DynamicEntity, with many additional functionalities for relevant behaviours and the removal of meshes/replacement with sprites.
- DungeonPopulator adds the varied tile types beyond Walls and Floors to the dungeon, sets up Entity spawns, and adds in additional obstacle walls tiles to the interiors of rooms.
- CollisionModified is a modified version of CollisionAvoidSteering based on Assignment 02, works with the altered World generation.

## Sources
- Code is all my own or those from class notes/assignments, or based on the latter. Did not use ChatGPT (or any LLMs or Agents or whatever) in any existing code, because the one single time I ever checked anything it hallucinated a bunch of built-in Three.js functions that did not exist so I got frustrated and just didn't touch or use it for anything present
- Player and Enemy sprites were drawn by me in MSPaint 
- Environment Tile sprites and the Bone sprite were ripped from Pokemon games (Mystery Dungeon Red Rescue Team and Black/White). Would have poorly drawn them myself but that would've taken up WAY too much time with making the tiles line up correctly and not look off.