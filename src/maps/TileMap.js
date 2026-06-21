import { Tile } from "./Tile";
import { LevelMap } from "./LevelMap";
import * as THREE from "three";
import { DungeonGenerator } from "../pcg/dungeons/DungeonGenerator";
import { DungeonPopulator } from "../pcg/dungeons/DungeonPopulator";


// TileMap class will hold information about our Tile grid
export class TileMap extends LevelMap {

  // TileMap constructor
  constructor(
    tileSize = 1,
    floor = 1,

    ...levelMapConfig
  ) {
    super(levelMapConfig);

    this.tileSize = tileSize;
    this.cols = Math.floor(this.width/this.tileSize);
    this.rows = Math.floor(this.depth/this.tileSize);

    this.grid = [];
    this.generateGrid();

    // Create our dungeon
    DungeonGenerator.generate(this, 4);
    

    // Hold walkable tiles to get random walkable tile
    this.walkableTiles = this.grid.flat().filter(tile => tile.isWalkable());
    this.edgeTiles;
 
    DungeonPopulator.generate(this, floor);
  }

  // Generate the tile grid with perlin noise
  generateGrid() {

    for (let r = 0; r < this.rows; r++) {
      let row = [];

      for (let c = 0; c < this.cols; c++) {

        let type = Tile.Type.Obstacle;
        let height = 5;

        row.push(
          new Tile(r, c, type, height)
        );
      }
      this.grid.push(row);
    }
  }

  // Get neighbours
  // Updated for walls (maze)
  getNeighbours(tile) {

    let neighbours = [];

    let r = tile.row;
    let c = tile.col;

    // North
    if (this.isWalkable(r - 1, c) && !tile.walls.north) {
      neighbours.push(this.grid[r - 1][c]);
    }

    // South
    if (this.isWalkable(r + 1, c) && !tile.walls.south) {
      neighbours.push(this.grid[r + 1][c]);
    }

    // East
    if (this.isWalkable(r, c + 1) && !tile.walls.east) {
      neighbours.push(this.grid[r][c + 1]);
    }

    // West 
    if (this.isWalkable(r, c - 1) && !tile.walls.west) {
      neighbours.push(this.grid[r][c - 1]);
    }

    return neighbours;

  }

  // Get adjacent tiles
  getAdjacentTiles(tile) {

    let neighbours = []

    // we can move in 4 possible directions
    let directions = [[-1,0], [1,0], [0,-1], [0,1]];

    // Iterate over the directions
    for (let d of directions) {
      let r = tile.row + d[0];
      let c = tile.col + d[1];

      // If the neighbouring tile is walkable
      // and it exists, add it to our list of neighbours
      if (this.isInGrid(r, c) && this.grid[r][c].isWalkable()) {
        neighbours.push(this.grid[r][c]);
      }
    }
    return neighbours;
  }

  getNearTiles(tile) {

    let neighbours = []

    // 8 directions to ensure no blockage
    let directions = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [1,-1], [1,-1], [1,1]];

    // Iterate over the directions
    for (let d of directions) {
      let r = tile.row + d[0];
      let c = tile.col + d[1];

      // If the neighbouring tile is walkable
      // and it exists, add it to our list of neighbours
      if (this.isInGrid(r, c) && this.grid[r][c].isWalkable()) {
        neighbours.push(this.grid[r][c]);
      }
    }
    return neighbours;
  }


  // Used for calculating the correct tile to use durinng stage rendering (so they line up correctly)
  // creates a binary number multiple digits long (each corresponding with a side, whether or not the adjacent tile is wall)
  getExtraNeighbours(tile) {
    let tileKey = 0;

    // we can move in 4 possible directions
    let directions = [[0,-1], [1,0], [0,1],[-1,0]];

    // Iterate over the directions
    let keyPart = 1
    for (let d of directions) {
      let r = tile.row + d[0];
      let c = tile.col + d[1];

      // If the neighbouring tile is walkable
      // and it exists, add value to key
      if (this.isInGrid(r, c) && !this.grid[r][c].isWalkable()) {
        tileKey = tileKey + keyPart;
      }
      else if (!this.isInGrid(r, c)){
        tileKey = tileKey + keyPart;
      }
      keyPart = keyPart * 10;
    }
    return tileKey;
  }

  // Test if in the grid
  isInGrid(row, col) {
    return (
      row >= 0 && row < this.rows &&
      col >= 0 && col < this.cols
    );
  }

  // Quantize
  // Converts from Vector3 position to a tile
  quantize(position) {
    let row = Math.floor((position.z - this.minZ) / this.tileSize);
    let col = Math.floor((position.x - this.minX) / this.tileSize);
    return this.grid[row][col];
  }

  // Localize
  // Converts from a tile to a Vector3 position
  localize(tile) {
    return new THREE.Vector3(
      tile.col * this.tileSize + this.minX + this.tileSize / 2, 
      0,
      tile.row * this.tileSize + this.minZ + this.tileSize / 2
    );
  }

  // Get random walkable tile
  getRandomWalkableTile() {
    //console.log(this.walkableTiles);
    let index = Math.floor(Math.random() * this.walkableTiles.length);
    return this.walkableTiles[index];
  }

  // Tests if node at row, col is walkable
  isWalkable(row, col) {
    if (!this.isInGrid(row, col)) return false;
    return this.grid[row][col].isWalkable();
  }

  getEdges() {
    this.edgeTiles = this.grid.flat().filter(tile => tile.checkEdge());
  } 

  // Collision detection (used sometimes)
  handleCollisions(entity) {

    let pos = entity.position.clone();
    let radius = Math.max(entity.scale.x, entity.scale.z) / 2;

    let tile = this.quantize(pos);
    let neighbours = this.getNeighbours(tile);

    let center = this.localize(tile);
    let half = this.tileSize / 2;

    // pushes position.z if collision north
    if (tile.row === 0 || !neighbours.includes(this.grid[tile.row - 1][tile.col])) {
      let dz = pos.z - (center.z - half);
      if (Math.abs(dz) < radius)
        pos.z += Math.sign(dz) * (radius - Math.abs(dz));
    }

    // pushes position.z if collision south
    if (tile.row === this.rows - 1 || !neighbours.includes(this.grid[tile.row + 1][tile.col])) {
      let dz = pos.z - (center.z + half);
      if (Math.abs(dz) < radius)
        pos.z += Math.sign(dz) * (radius - Math.abs(dz));
    }

    // pushes position.x if collision west
    if (tile.col === 0 || !neighbours.includes(this.grid[tile.row][tile.col - 1])) {
      let dx = pos.x - (center.x - half);
      if (Math.abs(dx) < radius)
        pos.x += Math.sign(dx) * (radius - Math.abs(dx));
    }

    // pushes position.x if collision east
    if (tile.col === this.cols - 1 || !neighbours.includes(this.grid[tile.row][tile.col + 1])) {
      let dx = pos.x - (center.x + half);
      if (Math.abs(dx) < radius)
        pos.x += Math.sign(dx) * (radius - Math.abs(dx));
    }

    return pos;
  }

}