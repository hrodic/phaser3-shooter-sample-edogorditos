import AnimatedTiles from 'phaser-animated-tiles/dist/AnimatedTiles.min.js';
import Bullet from '../gameObjects/Bullet.js';

class GameScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'GameScene'
        });
    }

    preload() {
        //this.load.scenePlugin('animatedTiles', AnimatedTiles, 'animatedTiles', 'animatedTiles');
        this.musicMetal = this.sound.add('metal', { loop: false, volume: 0.2 });
        this.pauseText = this.add.text(0, 0, 'Game is paused', { font: '30px Arial', fill: '#fff' });
        this.pauseText.setVisible(false);
    }

    create() {
        this.input.keyboard.on('keydown_PAUSE', (event) => {
            if (this.scene.systems.isActive() === false) {
                this.scene.resume();
                this.pauseText.setVisible(false);
            } else {
                this.scene.pause();
                this.pauseText.x = this.player.x + 10;
                this.pauseText.y = this.player.y + 10;
                this.pauseText.setVisible(true);
            }
        });

        this.musicMetal.play();

        // Enables movement of player with WASD keys
        this.input.keyboard.on('keydown_NINE', (event) => {
            this.musicMetal.resume();
        });
        this.input.keyboard.on('keydown_ZERO', (event) => {
            this.musicMetal.pause();
        });

        // Set world and physics bounds
        this.cameras.main.setBounds();
        this.physics.world.setBounds(0, 0, 1000, 1000);

        // Add 2 groups for Bullet objects
        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

        // Add player, enemy, reticle, healthpoint sprites
        this.player = this.physics.add.sprite(500, 500, 'player_handgun');
        this.playersMaxVelocity = 300;
        this.enemy = this.physics.add.sprite(Math.random()*1000, Math.random()*1000, 'player_handgun');
        this.reticle = this.physics.add.sprite(800, 700, 'target');
        this.hitPointBar = {
            1: this.add.image(-100, 0, 'target'),
            2: this.add.image(-90, 0, 'target'),
            3: this.add.image(-80, 0, 'target')
        };
        this.hitPointBar[1].setOrigin(0, 0).setDisplaySize(10, 10);
        this.hitPointBar[2].setOrigin(0, 0).setDisplaySize(10, 10);
        this.hitPointBar[3].setOrigin(0, 0).setDisplaySize(10, 10);

        // Set image/sprite properties
        this.player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(800, 800);
        this.enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
        this.reticle.setOrigin(0.5, 0.5).setDisplaySize(5, 5).setCollideWorldBounds(false);

        // Set sprite variables
        this.player.health = 10;
        this.enemy.health = 10;
        this.enemy.lastFired = 0;

        // set camera follow
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Creates object for input with WASD kets
        this.moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });

        // Enables movement of player with WASD keys
        this.input.keyboard.on('keydown_W', (event) => {
            this.player.setAccelerationY(-800);
        });
        this.input.keyboard.on('keydown_S', (event) => {
            this.player.setAccelerationY(800);
        });
        this.input.keyboard.on('keydown_A', (event) => {
            this.player.setAccelerationX(-800);
        });
        this.input.keyboard.on('keydown_D', (event) => {
            this.player.setAccelerationX(800);
        });
        this.input.keyboard.on('keydown_SHIFT', (event) => {
            this.playersMaxVelocity = 800;
        });

        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', (event) => {
            if (this.moveKeys['down'].isUp)
                this.player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_S', (event) => {
            if (this.moveKeys['up'].isUp)
                this.player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_A', (event) => {
            if (this.moveKeys['right'].isUp)
                this.player.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_D', (event) => {
            if (this.moveKeys['left'].isUp)
                this.player.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_SHIFT', (event) => {
            this.playersMaxVelocity = 300;
        });

        // Fires bullet from player on left click of mouse
        this.input.on('pointerdown', (pointer, time, lastFired) => {
            if (this.player.active === false)
                return;

            // Get bullet from bullets group
            var bullet = this.playerBullets.get().setActive(true).setVisible(true);

            if (bullet) {
                bullet.fire(this.player, this.reticle);
                this.physics.add.collider(this.enemy, bullet, (enemyHit, bulletHit) => { this.enemyHitCallback(enemyHit, bulletHit) });
            }
        });

        // Pointer lock will only work after mousedown
        this.sys.game.canvas.addEventListener('mousedown', () => {
            this.sys.game.input.mouse.requestPointerLock();
        });

        // Move reticle upon locked pointer move
        this.graphics = this.add.graphics({ lineStyle: { width: 0.5, color: 0xff0000 } });
        this.aimLine = new Phaser.Geom.Line(this.player.x, this.player.y, this.reticle.x, this.reticle.y);
        this.input.on('pointermove', (pointer) => {
            if (this.input.mouse.locked) {
                this.reticle.x += pointer.movementX;
                this.reticle.y += pointer.movementY;
                this.aimLine.x2 = this.reticle.x;
                this.aimLine.y2 = this.reticle.y;
            }
        });

        let text = this.add.text(this.reticle.x, this.reticle.y, 'Kill him!!', {
            fontSize: '64px', fill: '#000', boundsAlignH: "center", boundsAlignV: "middle"
        });
    }

    update(time, delta) {
        if (false === this.scene.systems.isActive()) {
            return;
        }

        // Rotates player to face towards reticle
        this.player.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.reticle.x, this.reticle.y);

        // Rotates enemy to face towards player
        this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);

        //Make reticle move with player
        this.reticle.body.velocity.x = this.player.body.velocity.x;
        this.reticle.body.velocity.y = this.player.body.velocity.y;

        let reticleDirection = Math.atan((this.reticle.x - this.player.x) / (this.reticle.y - this.player.y));

        this.aimLine.x1 = this.player.x
        this.aimLine.y1 = this.player.y

        this.graphics.clear();
        this.graphics.strokeLineShape(this.aimLine);

        // Constrain velocity of player
        this.constrainVelocity(this.player);

        // Constrain position of constrainReticle
        this.constrainReticle(this.reticle);

        // Make enemy fire
        this.enemyFire(this.enemy, this.player, this.time);
    }

    enemyHitCallback(enemyHit, bulletHit) {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true) {
            enemyHit.health = enemyHit.health - 1;
            let enemyHitUserFeedback = this.add.text(this.enemy.x, this.enemy.y - 40, '-1', { font: '20px Arial', fill: '#ff0000' });
            this.time.addEvent({ delay: 500, callback: () => { enemyHitUserFeedback.destroy() }, callbackScope: this, loop: false });

            let painVoiceList = ["pain1", "pain2", "pain3", "pain4", "pain5"];
            let painVoice = painVoiceList[Math.floor(Math.random() * painVoiceList.length)];
            this.sound.playAudioSprite('voice', painVoice, { volume: 1 });

            // Kill enemy if health <= 0
            if (enemyHit.health <= 0) {
                this.sound.playAudioSprite('voice', 'pain6', { volume: 1 });
                enemyHit.setActive(false).setVisible(false);
                this.time.addEvent({
                    delay: 500, callback: () => this.endGame(), callbackScope: this, loop: false
                });
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    enemyFire(enemy, player, time) {
        if (enemy.active === false) {
            return;
        }
        if ((time.now - enemy.lastFired) > Math.max(Math.random(), 0.2) * 2000) {
            enemy.lastFired = time.now;

            // Get bullet from bullets group
            var bullet = this.enemyBullets.get().setActive(true).setVisible(true);

            if (bullet) {
                bullet.fire(enemy, player);
                // Add collider between bullet and player
                this.physics.add.collider(this.player, bullet, (enemyHit, bulletHit) => { this.playerHitCallback(enemyHit, bulletHit) });
            }
        }
    }

    playerHitCallback(playerHit, bulletHit) {
        // Reduce health of player
        if (bulletHit.active === true && playerHit.active === true) {
            playerHit.health = playerHit.health - 1;

            let playerHitUserFeedback = this.add.text(this.player.x, this.player.y - 40, '-1', { font: '20px Arial', fill: '#ff0000' });
            this.time.addEvent({ delay: 500, callback: () => { playerHitUserFeedback.destroy() }, callbackScope: this, loop: false });

            let painVoiceList = ["pain1", "pain2", "pain3", "pain4", "pain5"];
            let painVoice = painVoiceList[Math.floor(Math.random() * painVoiceList.length)];
            this.sound.playAudioSprite('voice', painVoice, { volume: 1 });

            // Kill hp sprites and kill player if health <= 0
            if (playerHit.health === 8) {
                this.hitPointBar[1].destroy();
            }
            else if (playerHit.health === 2) {
                this.hitPointBar[2].destroy();
            }
            else if (playerHit.health === 0) {
                this.sound.playAudioSprite('voice', 'pain6', { volume: 1 });
                this.hitPointBar[3].destroy();
                this.time.addEvent({
                    delay: 500, callback: () => this.endGame(), callbackScope: this, loop: false
                });
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    endGame() {
        this.input.keyboard.removeAllListeners();
        this.scene.stop('GameScene');
        this.scene.launch('TitleScene');
    };

    // Ensures sprite speed doesnt exceed maxVelocity while update is called
    constrainVelocity(sprite) {
        if (!sprite || !sprite.body)
            return;

        var angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > this.playersMaxVelocity * this.playersMaxVelocity) {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * this.playersMaxVelocity;
            vy = Math.sin(angle) * this.playersMaxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }

    // Ensures reticle does not move offscreen
    constrainReticle(reticle) {
        var distX = reticle.x - this.player.x; // X distance between player & reticle
        var distY = reticle.y - this.player.y; // Y distance between player & reticle

        // Ensures reticle cannot be moved offscreen (player follow)
        if (distX > 800)
            this.reticle.x = this.player.x + 800;
        else if (distX < -800)
            this.reticle.x = this.player.x - 800;

        if (distY > 600)
            this.reticle.y = this.player.y + 600;
        else if (distY < -600)
            this.reticle.y = this.player.y - 600;
    }
}

export default GameScene;
