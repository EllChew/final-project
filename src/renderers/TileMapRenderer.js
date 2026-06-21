import * as THREE from 'three';
import { Tile } from '../maps/Tile';

// Tile map renderer
export class TileMapRenderer {

  // Constructor takes in a tile map
  constructor(tileMap) {
    this.map = tileMap;

    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshStandardMaterial();

    // Creates an instanced mesh for tiles
    this.mesh = new THREE.InstancedMesh(geometry, material, this.map.rows * this.map.cols);

    // Get the wall count for our instanced mesh
    this.wallCount = 0;
    for (let r = 0; r < this.map.rows; r++) {
      for (let c = 0; c < this.map.cols; c++) {
        let tile = this.map.grid[r][c];

        if (tile.walls.north) this.wallCount++;
        if (tile.walls.west) this.wallCount++;
        if (tile.walls.south) this.wallCount++;
        if (tile.walls.east)  this.wallCount++;
      }
    }

    // Create wall instanced mesh
    this.wallGeometry = new THREE.BoxGeometry();
    this.wallMaterial = new THREE.MeshStandardMaterial({ color: '#333333' });

    this.wallMesh = new THREE.InstancedMesh(
      this.wallGeometry,
      this.wallMaterial,
      this.wallCount
    );

    this.wallIndex = 0;


    // For each tile, 
    // create a tile rendering
    // create wall renderings
    for (let r = 0; r < this.map.rows; r++) {
      for (let c = 0; c < this.map.cols; c++) {
        let tile = this.map.grid[r][c];
        this.createTile(tile);
        this.createWalls(tile);
      }
    }
  }

  // Create the tile by setting the instanced mesh
  // at the tiles index to the tiles transformation
  // and the desired tile colour
  createTile(tile) {
    let index = tile.row * this.map.cols + tile.col;
    this.mesh.setMatrixAt(index, this.getTileTransformation(tile));
    this.mesh.setColorAt(index, this.getTileColor(tile));
  }

  // Create the walls by setting the instanced mesh
  // at the walls index to the walls transformation
  createWalls(tile) {

    let pos = this.map.localize(tile);

    let size = this.map.tileSize;
    let height = 10;
    let thickness = 0.1;

    let matrix = new THREE.Matrix4();

    // NORTH
    if (tile.walls.north) {
      matrix.makeScale(size, height, thickness);
      matrix.setPosition(pos.x, height / 2, pos.z - size / 2);
      this.wallMesh.setMatrixAt(this.wallIndex++, matrix);
    }

    // SOUTH
    if (tile.walls.south) {
      matrix.makeScale(size, height, thickness);
      matrix.setPosition(pos.x, height / 2, pos.z + size / 2);
      this.wallMesh.setMatrixAt(this.wallIndex++, matrix);
    }

    // WEST
    if (tile.walls.west) {
      matrix.makeScale(thickness, height, size);
      matrix.setPosition(pos.x - size / 2, height / 2, pos.z);
      this.wallMesh.setMatrixAt(this.wallIndex++, matrix);
    }

    // EAST
    if (tile.walls.east) {
      matrix.makeScale(thickness, height, size);
      matrix.setPosition(pos.x + size / 2, height / 2, pos.z);
      this.wallMesh.setMatrixAt(this.wallIndex++, matrix);
    }
  }

  // Get the tile transformation matrix
  getTileTransformation(tile) {
    let pos = this.map.localize(tile);
    pos.y = tile.height / 2;

    let matrix = new THREE.Matrix4();
    matrix.makeScale(this.map.tileSize, tile.height, this.map.tileSize);
    matrix.setPosition(pos);
    return matrix;
  }
  
  // Get the tile colour
  getTileColor(tile) {
    switch (tile.type) {
      case Tile.Type.Ground:   return new THREE.Color('#bac2b8');
      case Tile.Type.Obstacle: return new THREE.Color('#262297');
      default:                 return new THREE.Color('black');
    }
  }

  // Set the tile colour
  setTileColor(tile, color) {
    let index = tile.row * this.map.cols + tile.col;
    this.mesh.setColorAt(index, color);
  }

  // Render to our scene
  render(scene) {
    scene.add(this.mesh);
    scene.add(this.wallMesh);
  }

}
