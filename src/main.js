import paper from 'paper';
import MetaBall from './components/MetaBall.js';

paper.install(window);

// Define 'connections' en un ámbito global
let connections;
const handle_len_rate = 2.4;

function generateConnections(metaBalls) {
	console.debug('metaBalls: ', metaBalls)
	// Asegúrate de que 'connections' esté definido
	if (!connections) return;

	// Elimina las conexiones anteriores
	connections.removeChildren();

	for (let i = 0; i < metaBalls.length; i++) {
		for (let j = i - 1; j >= 0; j--) {
			console.debug(metaBalls[i])
			let path = metaball(metaBalls[i], metaBalls[j], 0.5, handle_len_rate, 300);
			if (path) {
				connections.addChild(path);
				path.removeOnMove();
			}
		}
	}
}

window.onload = function () {
	// Supongamos que este es el objetivo para el nivel 1
	let objectiveStructurePoints = [[200, 150], [300, 150], [250, 200]];

	paper.setup(document.getElementById('myCanvas'));
	paper.project.currentStyle = {
		fillColor: 'black'
	};

	// Inicializa 'connections' después de configurar el lienzo
	connections = new paper.Group();

	let ballPositions = [[255, 129], [610, 73], [486, 363],
	[117, 459], [484, 726], [843, 306], [789, 615], [1049, 82],
	[1292, 428], [1117, 733], [1352, 86], [92, 798]];
	let metaBalls = ballPositions.map(pos => new paper.Path.Circle({
		center: pos,
		radius: 50
	}));

	let largeMetaBall = new MetaBall([676, 433], 100);
	metaBalls.push(largeMetaBall);

	paper.view.onMouseMove = function (event) {
		largeMetaBall.updatePosition(event.point);
		generateConnections(metaBalls);
	};

	// Dibuja la estructura objetivo
	drawObjectiveStructure(objectiveStructurePoints);

	// Resto del código...

	// En tu bucle de juego o evento, podrías llamar a esta función para verificar si el jugador ha completado el objetivo
	if (isObjectiveCompleted(metaBalls, objectiveStructurePoints)) {
		// El jugador ha completado el objetivo
		console.log("¡Estructura completada!");
		// Aquí puedes implementar la lógica para avanzar al siguiente nivel o mostrar una animación de éxito
	}
}

function drawObjectiveStructure(points) {
	// Dibuja una forma translúcida basada en los puntos dados
	let path = new paper.Path({
		segments: points,
		strokeColor: 'blue',
		strokeWidth: 2,
		dashArray: [4, 4],
		closed: true
	});
	path.opacity = 0.5;
}

function isObjectiveCompleted(metaBalls, objectivePoints, threshold = 10) {
	// Verifica si cada punto objetivo tiene una Meta Ball cercana
	return objectivePoints.every(point => {
		return metaBalls.some(metaBall => {
			let distance = metaBall.circlePath.position.getDistance(new paper.Point(point));
			return distance <= threshold;
		});
	});
}

// ---------------------------------------------
function metaball(ball1, ball2, v, handle_len_rate, maxDistance) {
	if (!ball1 || !ball2 || !ball1.position || !ball2.position) {
		console.debug('ball1: ', ball1 + ' \n' + 'ball2: ', ball2)
		console.error("Invalid objects passed to metaball function");
		return;
	}

	console.debug('ball1: ', ball1.position + ' \n' + 'ball2: ', ball2.position + ' Line 101')



	let center1 = ball1.position;
	let center2 = ball2.position;
	let radius1 = ball1.width / 2;
	let radius2 = ball2.width / 2;
	let pi2 = Math.PI / 2;
	let d = center1.getDistance(center2);
	let u1, u2;

	if (radius1 == 0 || radius2 == 0)
		return;

	if (d > maxDistance || d <= Math.abs(radius1 - radius2)) {
		return;
	} else if (d < radius1 + radius2) { // case circles are overlapping
		u1 = Math.acos((radius1 * radius1 + d * d - radius2 * radius2) /
			(2 * radius1 * d));
		u2 = Math.acos((radius2 * radius2 + d * d - radius1 * radius1) /
			(2 * radius2 * d));
	} else {
		u1 = 0;
		u2 = 0;
	}

	let vector = center2.subtract(center1); // Crea un vector desde center1 a center2
	let angle1 = vector.angleInRadians;     // Obtén el ángulo en radianes del vector
	let angle2 = Math.acos((radius1 - radius2) / d);
	let angle1a = angle1 + u1 + (angle2 - u1) * v;
	let angle1b = angle1 - u1 - (angle2 - u1) * v;
	let angle2a = angle1 + Math.PI - u2 - (Math.PI - u2 - angle2) * v;
	let angle2b = angle1 - Math.PI + u2 + (Math.PI - u2 - angle2) * v;
	let p1a = center1 + getVector(angle1a, radius1);
	let p1b = center1 + getVector(angle1b, radius1);
	let p2a = center2 + getVector(angle2a, radius2);
	let p2b = center2 + getVector(angle2b, radius2);

	// define handle length by the distance between
	// both ends of the curve to draw
	let totalRadius = (radius1 + radius2);
	let d2 = Math.min(v * handle_len_rate, (p1a - p2a).length / totalRadius);

	// case circles are overlapping:
	d2 *= Math.min(1, d * 2 / (radius1 + radius2));

	radius1 *= d2;
	radius2 *= d2;

	let path = new Path({
		segments: [p1a, p2a, p2b, p1b],
		style: ball1.style,
		closed: true
	});
	let segments = path.segments;
	segments[0].handleOut = getVector(angle1a - pi2, radius1);
	segments[1].handleIn = getVector(angle2a + pi2, radius2);
	segments[2].handleOut = getVector(angle2b - pi2, radius2);
	segments[3].handleIn = getVector(angle1b + pi2, radius1);
	return path;
}

// ------------------------------------------------

function getVector(radians, length) {
	return new Point({
		// Convert radians to degrees:
		angle: radians * 180 / Math.PI,
		length: length
	});
}