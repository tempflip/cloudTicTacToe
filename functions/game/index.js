const Firestore = require('@google-cloud/firestore');
const PRID = 'tictac-306815';

const toTable = (game, n=3) => {
	let r = [];
	for (var i = 0; i<n; i++) {
		let t = [];
		for (var j = 0; j<n; j++) {
			t.push(game[i*3 + j] || 0);
		}
		r.push(t);
	}
	return r;
};

const newGame = (db, res) =>  {
	let myGame = {
		table : [0,0]
		};

	db.collection('games').add(myGame).then(doc => {
		let r = {id : doc.id};
		res.send(JSON.stringify(r, null, 4));
	}).catch(err => {
		console.log(err);
	});
};

const getGame = (res, doc) => {
	let r = { id : doc.id,
				game : toTable(doc.data().table)
			};
	res.send(JSON.stringify(r, null, 4));
};

const makeMove = (res, db, paramString) => {
	const params = JSON.parse(paramString);
	const gameId = params.id;
	const player = params.player;
	const move = params.move[0] * 3 + params.move[1];
	
	if (!gameId) {
		errorResponse(res, 'non-existing id' + JSON.stringify(params));
		return;
	}
	if (player === undefined) {
		errorResponse(res, 'no player!');
		return;
	}
	if (move === undefined) {
		errorResponse(res, 'no move!');
		return;
	}
	db.collection('games').doc(gameId).get()  
	.then(doc => {
		let table = doc.data().table;
		if (!moveAllowed(table, move, player) ) {
			errorResponse(res, 'this move is not allowed.');
			return;
		}
		table = fillTable(table, move, player);
		console.log('# table: ', table);
		db.collection('games').doc(gameId).update({table : table})
			.then(doc => {
				res.send('danke <33 ');
			});
	}).catch(err => {
		errorResponse(res, JSON.stringify(err));
	});
}

moveAllowed = (table, move, player) => {
	if (table[move] === 1 || table[move] === 2) return false;

	let pl1 = table.filter(el => el === 1).length;
	let pl2 = table.filter(el => el === 2).length;
	if (player == 1) {
		if (pl1 == pl2) return true;
	} else if (player == 2) {
		if (pl2 < pl1) return true;
	}
	return false;
}
const fillTable = (table, move, player) => {
	for (i = 0; i < move; i++) {
		if (table[i]) continue;
		table[i] = 0;
	}
	table[move] = parseInt(player);
	return table;
}

const errorResponse = (res, message) => {
		res.status(400).send(message);
}
exports.game= (req, res) => {
	const db = new Firestore({projectId : PRID});
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('content-type', 'application/json');

	if (req.method == 'GET') {
		const gameId = req.query.id;
		if (!gameId) {
			newGame(db, res);
			return;
		}

		db.collection('games').doc(gameId).get()
		.then(doc => {
			getGame(res, doc);
		}) 
		.catch(err => {
			newGame(db, res);
		});
	} else if (req.method == 'POST') {
		makeMove(res, db, req.body);
	}

}
