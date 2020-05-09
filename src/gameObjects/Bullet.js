export default class Bullet extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene);
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
    this.speed = 2;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.setDisplaySize(10, 5);
    this.casingWeaponSoundList = ["casing1", "casing2", "casing3"];
  }

  runCasingWeaponSound() {
    let casingWeaponSound = this.casingWeaponSoundList[Math.floor(Math.random() * this.casingWeaponSoundList.length)];
      this.scene.sound.playAudioSprite('weapon', casingWeaponSound, { loop: false, volume: 0.2 });
  }

  // Fires a bullet from the player to the reticle
  fire(shooter, target) {
    this.scene.sound.playAudioSprite('weapon', 'm9', { volume: 0.9 });
    this.scene.time.addEvent({ delay: 500, callback: () => { this.runCasingWeaponSound() }, callbackScope: this, loop: false });
    
    // start from player
    this.setPosition(shooter.x, shooter.y);
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction);
      this.ySpeed = this.speed * Math.cos(this.direction);
    }
    else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }
    // fix position so it seems its being fired from the gun
    this.setPosition(shooter.x + (this.xSpeed * 30), shooter.y + (this.ySpeed * 30));
    this.rotation = shooter.rotation; // angle bullet with shooters rotation
    this.born = 0; // Time since new bullet spawned
  }

  // Updates the position of the bullet each cycle
  update(time, delta) {
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;
    this.born += delta;
    if (this.born > 1800) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}