import * as THREE from 'three';

export class TextureLoader {

    // Loads textures

    constructor() {

        this.keyMap = new Map();

        this.loader = new THREE.TextureLoader();

        this.getWalls();
        this.getGround();
        this.getEntities();

    }
    
    // Ground Textures
    getGround() {
        this.keyMap.set("ground", new THREE.TextureLoader().load( './ground.png' ));
        this.keyMap.set("mushroom", new THREE.TextureLoader().load( './mushroom.png' ));
        this.keyMap.set("grass", new THREE.TextureLoader().load( './grass.png' ));
        this.keyMap.set("puddle", new THREE.TextureLoader().load( './puddle.png' ));
        this.keyMap.set("hole", new THREE.TextureLoader().load( './hole.png' ));
        this.keyMap.set("stairs", new THREE.TextureLoader().load( './stairs.png' ));
        this.keyMap.set("bush", new THREE.TextureLoader().load( './bush.png' ));
    }

    // Wall Textures
    getWalls() {

        this.keyMap.set("0", new THREE.TextureLoader().load( './walls/0000.png' ));
        this.keyMap.set("1", new THREE.TextureLoader().load( './walls/0001.png' ));
        this.keyMap.set("10", new THREE.TextureLoader().load( './walls/0010.png' ));
        this.keyMap.set("11", new THREE.TextureLoader().load( './walls/0011.png' ));

        this.keyMap.set("100", new THREE.TextureLoader().load( './walls/0100.png' ));
        this.keyMap.set("101", new THREE.TextureLoader().load( './walls/0101.png' ));
        this.keyMap.set("110", new THREE.TextureLoader().load( './walls/0110.png' ));
        this.keyMap.set("111", new THREE.TextureLoader().load( './walls/0111.png' ));

        this.keyMap.set("1000", new THREE.TextureLoader().load( './walls/1000.png' ));
        this.keyMap.set("1001", new THREE.TextureLoader().load( './walls/1001.png' ));
        this.keyMap.set("1010", new THREE.TextureLoader().load( './walls/1010.png' ));
        this.keyMap.set("1011", new THREE.TextureLoader().load( './walls/1011.png' ));

        this.keyMap.set("1100", new THREE.TextureLoader().load( './walls/1100.png' ));
        this.keyMap.set("1101", new THREE.TextureLoader().load( './walls/1101.png' ));
        this.keyMap.set("1110", new THREE.TextureLoader().load( './walls/1110.png' ));
        this.keyMap.set("1111", new THREE.TextureLoader().load( './walls/1111.png' ));
    }

    // Entity Textures
    getEntities() {
        this.keyMap.set("bone", new THREE.TextureLoader().load( './bone.png' ));

        this.keyMap.set("player_idle", new THREE.TextureLoader().load( './entities/player/player_idle.png' ));
        this.keyMap.set("player_idle_n", new THREE.TextureLoader().load( './entities/player/player_idle_n.png' ));
        this.keyMap.set("player_bone", new THREE.TextureLoader().load( './entities/player/player_bone.png' ));
        this.keyMap.set("player_bone_n", new THREE.TextureLoader().load( './entities/player/player_bone_n.png' ));
        this.keyMap.set("player_hide", new THREE.TextureLoader().load( './entities/player/player_hide.png' ));
        this.keyMap.set("player_hide_n", new THREE.TextureLoader().load( './entities/player/player_hide_n.png' ));


        this.keyMap.set("wolf_idle", new THREE.TextureLoader().load( './entities/enemy/wolf_idle.png' ));
        this.keyMap.set("wolf_idle_n", new THREE.TextureLoader().load( './entities/enemy/wolf_idle_n.png' ));
        this.keyMap.set("wolf_dead", new THREE.TextureLoader().load( './entities/enemy/wolf_dead.png' ));
        
        this.keyMap.set("bunny_idle", new THREE.TextureLoader().load( './entities/enemy/bunny_idle.png' ));
        this.keyMap.set("bunny_idle_n", new THREE.TextureLoader().load( './entities/enemy/bunny_idle_n.png' ));
        this.keyMap.set("bunny_dead", new THREE.TextureLoader().load( './entities/enemy/bunny_dead.png' ));

        this.keyMap.set("cat_idle", new THREE.TextureLoader().load( './entities/enemy/cat_idle.png' ));
        this.keyMap.set("cat_idle_n", new THREE.TextureLoader().load( './entities/enemy/cat_idle_n.png' ));
        this.keyMap.set("cat_dead", new THREE.TextureLoader().load( './entities/enemy/cat_dead.png' ));
    }

}