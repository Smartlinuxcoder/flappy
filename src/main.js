const { default: kaboom } = require("kaboom")

// Responding to gravity & jumping
// Start kaboom

kaboom({
	width: 228,
	height: 512,
	scale: 3,
	fullscreen: true,
})

loadSprite("bg", "sprites/background-day.png")
loadSprite("downflap", "sprites/downflap.png")
loadSprite("base", "sprites/base.png")
loadSprite("pipe", "sprites/pipe.png")


scene("game", () => {
	// Set the gravity acceleration (pixels per second)
setGravity(1600);
const speed = -3500;
const PIPE_GAP = 200;

add([
	sprite("bg")
])
scene("game", () => {

  });
const player = add([
	sprite("downflap"),
	pos(center()),
	area(),
	body(),
]);

// Add a platform to hold the player
add([
	sprite("base"),
	/* 	rect(width(), 48), */
	area(),
	pos(0, height() - 48),
	// Give objects a body() component if you don't want other solid objects pass through
	body({ isStatic: true }),
	"base"
])



// Call the function to move the base continuously

onKeyPress("space", () => {
	// .isGrounded() is provided by body()
	player.jump(400)
})
onClick(() => {
	player.jump(400)
})
// .onGround() is provided by body(). It registers an event that runs whenever player hits the ground.
player.onGround(() => {
	/* debug.log("game over") */
	go("lose")
})


function producePipes() {
	const offset = rand(-50, 50);

	add([
		sprite("pipe"),
		pos(width(), height() / 2 + offset + PIPE_GAP / 2 ),
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
add([
	sprite("base"),
	/* 	rect(width(), 48), */
	area(),
	pos(336, height() - 48),
	// Give objects a body() component if you don't want other solid objects pass through
	body({ isStatic: true }),
	"base"
])

// Function to move the base
function moveBase() {
	onUpdate("base", (base) => {
		base.move(speed * dt(), 0); // Adjust the speed of the base (here, it's set to move at 100 units per second)

		// Reset the position of the base when it moves off-screen to create the illusion of endless scrolling
		if (base.pos.x + base.width < 3) {
			base.moveTo(336, base.pos.y);
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