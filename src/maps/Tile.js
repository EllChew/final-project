// Tile class, which is our nodes
export class Tile {

  // Possible tile types
  static Type = Object.freeze({
    Ground: Symbol("Ground"),
    Obstacle: Symbol("Obstacle"),
    PlayerSpawn: Symbol("PlayerSpawn"),
    EnemySpawn: Symbol("EnemySpawn"),
    Bush: Symbol("Bush"),
    Hole: Symbol("Hole"),
    Stairs: Symbol("Stairs"),
    Puddle: Symbol("Puddle"), //not used in end, ignore
    BoneSpawn: Symbol("BoneSpawn")
  });

  // Map to hold costs associated with types
  static Cost = new Map([
    [Tile.Type.Ground, 1],
    [Tile.Type.Obstacle, 10]
  ]);

  // Tile constructor
  constructor(row, col, type = Tile.Type.Ground, height = 1) {
    this.row = row;
    this.col = col;
    this.type = type;
    this.height = height;
    this.cost = Tile.Cost.get(this.type);
    
    this.noisy = false; // if the tile makes a noise when the player steps on it
    this.enemySpawnType; // set up by DungeonPopulator for Enemy Spawning, tells what enemy type spawns on this tile (if any)
    this.hasBone = false; // tells if the tile has a bone on it
    this.bone; // reference to bone

    this.isPuddle = false; // tells if the tile is a puddle (for Cat State Machine)
    this.isEdge = false;

    this.walls = {
      north: false,
      south: false,
      east: false,
      west: false
    };
  }

  // Check to see if we can walk on this tile
  isWalkable() {
    return this.type !== Tile.Type.Obstacle;
  }

  checkEdge() {
    return this.isEdge == true;
  }

}