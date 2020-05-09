class BootScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'BootScene'
        });
    }
    preload() {
        const progress = this.add.graphics();

        // Register a load progress event to show a load bar
        this.load.on('progress', (value) => {
            progress.clear();
            progress.fillStyle(0xffffff, 1);
            progress.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 60);
        });

        // Register a load complete event to launch the title screen when all files are loaded
        this.load.on('complete', () => {
            progress.destroy();
            this.scene.start('TitleScene');
        });

        this.load.audio('heavy-pattern', [
            'assets/audio/music/heavy-pattern.ogg',
        ]);
        this.load.audio('metal', [
            'assets/audio/music/metal.ogg'
        ]);
        this.load.audioSprite('voice', 'assets/audio/voiceSFX.json');
        this.load.audioSprite('weapon', 'assets/audio/weaponSFX.json');

        // Load in images and sprites
        this.load.spritesheet('player_handgun', 'assets/images/player.png',
            { frameWidth: 66, frameHeight: 60 }
        ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('target', 'assets/images/bullet.png');
    }
}

export default BootScene;
