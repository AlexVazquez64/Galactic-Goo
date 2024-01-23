// MetaBall.js
export default class MetaBall {
	constructor(position, radius) {
		this.position = position;
		this.radius = radius;
		this.draw();
	}

	draw() {
		this.circlePath = new paper.Path.Circle({
			center: this.position,
			radius: this.radius,
			fillColor: 'black'
		});

		if (!this.circlePath) {
			console.error("Failed to create circlePath in MetaBall", this);
		}
	}

	// Método para actualizar la posición de la Meta Ball
	updatePosition(newPosition) {
		this.position = newPosition;
		if (this.circlePath) {
			this.circlePath.position = newPosition;
		}
	}
}
