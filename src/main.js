const { default: kaboom } = require("kaboom")

// Responding to gravity & jumping
// Start kaboom
var w = window.innerWidth;
var h = window.innerHeight;
console.log(h)
kaboom({
	width: w, //228
	height: h, //512
	scale: 1,
	fullscreen: true,
})

loadSprite("bg", "sprites/background-day.png")
loadSprite("downflap", "sprites/downflap.png")
loadSprite("base", "sprites/base.png")
loadSprite("pipe", "sprites/pipe.png")


scene("game", () => {
	// Set the gravity acceleration (pixels per second)
	setGravity(1600);
	const speed = -35000;
	const PIPE_GAP = 200;


	const initialScale = h / 512; // Adjust the initial scale as needed

	// Create a function to continuously add and scroll the background until the screen width is reached
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

	addBackground(); // Call the function to start the background

	const player = add([
		sprite("downflap"),
		pos(center()),
/* 		area(),
		body(), */
	]);



	onKeyPress("space", () => {
		// .isGrounded() is provided by body()
		player.jump(400)
	})
	onClick(() => {
		player.jump(400)
	})
	// .onGround() is provided by body(). It registers an event that runs whenever player hits the ground.
/* 	player.onGround(() => {
		debug.log("game over")
		go("lose")
	}) */


	function producePipes() {
		const offset = rand(-50, 50);

		add([
			sprite("pipe"),
			pos(width(), height() / 2 + offset + PIPE_GAP / 2),
			"pipe",
			area(),
			body({ isStatic: true }),
		]);

		add([
			sprite("pipe", { flipY: true }),
			pos(width(), height() / 2 + offset - PIPE_GAP / 2 - 288),
			/* 		origin("botleft"), */
			"pipe",
			area(),
			body({ isStatic: true }),
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
				pos(basex, h-h/5),
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
			pos(basex, h-h/5),
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
			if (base.pos.x  < -672*initialScale/2) {

				base.moveTo(getFurthestRightXPosition("base")+ (336 * initialScale)-350, base.pos.y);
			}
		});
	}
	moveBase();

	onUpdate("pipe", (pipe) => {
		pipe.move(speed * dt(), 0);
	});

	loop(2, () => {
		producePipes();
	});
});

scene("lose", (score) => {
	add([
		sprite("bg")
	])
	add([
		sprite("downflap"),
		pos(width() / 2, height() / 2 - 108),
		/* scale(3), */
	]);
	// display score
	add([
		text("You lost"),
		/* 		pos(width() / 2, height() / 2 + 108),
				scale(3), */
	]);
	// go back to game with space is pressed
	onKeyDown("space", () => go("game"));
	onClick(() => go("game"));
});

go("game")