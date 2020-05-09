class TitleScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'TitleScene'
        });
    }
    preload() {
    }
    create() {
        this.scene.bringToTop();

        this.input.keyboard.once('keydown', (event) => {
            this.startGame();
        });

        //var music = this.sound.addAudioSprite('tracks');
        this.musicHeavyPattern = this.sound.add('heavy-pattern', { loop: true, volume: 0.5 })
        this.musicHeavyPattern.play();

        let content = [
            "",
            "Edo Gorditos shooter",
            "",
            "directed by Rodrigo",
            "    ",
            "somewhere within diputacio building...",
        ];
        let textString = [
            "Rodrigo presents... \n",
            "Edo Gorditos Shooter\n",
            "\nPress any key to start..."
        ];
        let text = this.add.text(100, 100, textString, { font: "30pt Courier", fill: "#ffffff", stroke: "#119f4e", strokeThickness: 2 });
    }

    update(time, delta) {
    }

    startGame() {
        this.musicHeavyPattern.stop();
        this.scene.stop('GameScene');
        this.scene.start('GameScene');
    }

    restartScene() {
        this.scene.stop('GameScene');
        this.scene.launch('GameScene');
        this.scene.bringToTop();
    }
}

export default TitleScene;
