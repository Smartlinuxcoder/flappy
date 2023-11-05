const { default: kaboom } = require("kaboom")

// Responding to gravity & jumping
// Start kaboom
let canvasWidth = document.documentElement.clientWidth;
let canvasHeight = document.documentElement.clientHeight;
let deviceMode = null;
let heightStretch = 0;
if ((window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.fullscreen) && navigator.userAgent.includes('Android')) {
	// Code for PWA running on Android
	deviceMode = "Android";
	heightStretch = 75;
} else if ((window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.fullscreen) && navigator.userAgent.includes('CrOS')) {
	// Code for PWA running on Chrome OS
	deviceMode = "ChromeOS";
} else {
	// Code for non-PWA behavior or other platforms
	deviceMode = "Other";
}
var w = canvasWidth;
var h = canvasHeight;
/* var w = window.innerWidth;
var h = window.innerHeight;  */
var score = 0;
var highScore = 0;


kaboom({
	width: w, //228
	height: h, //512
	scale: 1,

	/* 	fullscreen: true, */
})

loadSprite("bg", "sprites/background-day.png")
loadSprite("downflap", "sprites/downflap.png")
loadSprite("base", "sprites/base.png")
loadSprite("pipe", "sprites/pipe.png")
loadSprite("message", "sprites/message.png")
loadFont("flappy-font", "sprites/flappy-font.ttf")
loadSound("point", "sprites/point.wav")
loadSound("die", "sprites/die.wav")
const initialScale = h / 512; // Adjust the initial scale as needed

function addBackground() {
	let xPosition = 0;
	while (xPosition < w) {
		add([
			sprite("bg"),
			scale(initialScale),
			pos(xPosition, 0),
			/* 				layer("bg"), */
		]);
		xPosition += 228 * initialScale; // Move to the next sprite position
	}
}

scene("game", () => {
	score = 0
	// Set the gravity acceleration (pixels per second)
	setGravity(1600);
	const speed = -3500 * initialScale;
	const PIPE_GAP = 200 * initialScale;

	addBackground(); // Call the function to start the background

	const player = add([
		sprite("downflap"),
		pos(center()),
		area(),
		body(),
		anchor("center"),
		scale(initialScale),
		"player"
	]);



	onKeyPress("space", () => {
		// .isGrounded() is provided by body()
		player.jump(250*initialScale)
	})
	onClick(() => {
		player.jump(250*initialScale)
	})
	// .onGround() is provided by body(). It registers an event that runs whenever player hits the ground.
	player.onGround(() => {
		/* 		debug.log("game over") */
		go("gameover", score)
	})


	function producePipes() {
		const offset = rand(-75, 75) * initialScale;

		add([
			sprite("pipe"),
			pos(width(), (height() / 2 + offset + PIPE_GAP / 2)),
			"pipe",
			area(),
			body({ isStatic: true }),
			scale(initialScale),
			{ passed: false },
			offscreen({ destroy: true, distance: 2000 }),
		]);

		add([
			sprite("pipe", { flipY: true }),
			pos(width(), (height() / 2 + offset - PIPE_GAP / 2 - 320 * initialScale)),
			/* 			origin('botleft'), */
			"pipe",
			area(),
			body({ isStatic: true }),
			scale(initialScale),
			offscreen({ destroy: true, distance: 2000 }),
		]);
	}
	function addBase() {
		var basex = 0;
		while (basex < w) {
			add([
				sprite("base"),
				scale(initialScale),
				/* 	rect(width(), 48), */
				area(),
				pos(basex, h - h / 5),
				// Give objects a body() component if you don't want other solid objects pass through
				body({ isStatic: true }),
				"base"
			])
			basex += 336 * initialScale; // Move to the next sprite position
		}
		add([
			sprite("base"),
			scale(initialScale),
			/* 	rect(width(), 48), */
			area(),
			pos(basex, h - h / 5),
			// Give objects a body() component if you don't want other solid objects pass through
			body({ isStatic: true }),
			"base"
		])
	}

	addBase(); // Call the function to start the background
	function getFurthestRightXPosition(spriteName) {
		const sprites = get(spriteName); // Get all sprites with the specified name
		let furthestX = -Infinity;

		sprites.forEach((sprite) => {
			if (sprite.pos.x + sprite.width > furthestX) {
				furthestX = sprite.pos.x + sprite.width;
			}
		});

		return furthestX;
	}
	// Function to move the base
	function moveBase() {
		onUpdate("base", (base) => {
			base.move(speed * dt(), 0);
			// Reset the position of the base when it moves off-screen to create the illusion of endless scrolling
			if (base.pos.x < -672 * initialScale / 2) {

				base.moveTo(getFurthestRightXPosition("base") + (336 * initialScale) - 350, base.pos.y);
			}
		});
	}
	moveBase();

	onUpdate("pipe", (pipe) => {
		pipe.move(speed * dt(), 0);
		if (pipe.passed === false && pipe.pos.x < player.pos.x) {
			pipe.passed = true;
			score += 1;
			play("point")
/* 			scoreText.text = score; */
		}
	});

	loop(initialScale, () => {
		producePipes();
	});

	onCollide("player", "pipe", () => {
		go("gameover", score);
	})
	const scoreText = add([
		text(score, {
			font: "flappy-font",
			size: 50
		}),
		pos(width() / 2, 0),
		anchor("top"),
		scale(initialScale),
	]);
	player.onUpdate(() => {
		scoreText.text = score;
		if (player.pos.y > height() + 30 || player.pos.y < -30) {
			go("gameover", score);
		}

	});
});

	scene("splash", (score) => {
		addBackground()
		/* 	const player = add([
				sprite("downflap"),
				pos(center()),
				scale(initialScale)
			]); */
		if (score > highScore) {
			highScore = score;
		}
		add([
			text("High score:" + highScore, {
				font: "flappy-font",
			}),
			pos(width() / 2, 0 ),
			scale(initialScale),
			anchor("top")
		]);

		const player = add([
			sprite("message"),
			pos(center()),
			anchor("center"),
			scale(initialScale),
		]);
		// go back to game with space is pressed
		onKeyDown("space", () => go("game"));
		onClick(() => go("game"));
	});

	scene("gameover", (score) => {
		addBackground()
		play("die")
		loadSprite("gameover", "sprites/gameover.png")
		add([
			sprite("gameover"),
			pos(center()),
			scale(initialScale),
			anchor("center"),
		])
		/* 	const player = add([
				sprite("downflap"),
				pos(center()),
				scale(initialScale)
			]); */
		if (score > highScore) {
			highScore = score;
		}
		add([
			text("High score:" + highScore, {
				font: "flappy-font",
			}),
			pos(width() / 2, 0 ),
			scale(initialScale),
			anchor("top")
		]);
		// go back to game with space is pressed
		onKeyDown("space", () => go("game"));
		onClick(() => go("game"));
	});

	go("splash")