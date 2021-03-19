const GAME_URL = 'https://us-central1-tictac-306815.cloudfunctions.net/game';

const getQuery = () => {
	let [url, params] = window.location.href.split('?');
	let q = {}
	if (!params) return q;

	params.split('&').forEach(el => {
		let [key, value] = el.split('=');
		q[key] = value;
	});
	return q;
}

const getGame = id => {
	let pr = new Promise((resolve, reject) => {
		fetch(GAME_URL + '?id=' + id)
		.then(r => {
			r.json().then(game => {
				resolve(game);
			});
		});
	});
	return pr;
};

const newGame = () => {
	console.log('## create a new game');
	let pr = new Promise((resolve, reject) => {
		fetch(GAME_URL)
		.then(r => {
			r.json().then(ng => {
				getGame(ng.id)
					.then(game => {
						resolve(game);
					});
			});
		});
	});
	return pr;
};

const showGame = (game) => {
	for (var i = 0; i <= 2; i++) {
		for (var j = 0; j <= 2; j++) {
			let elId = 'g' + i + j;
			let classToAdd;
			if (game.game[i][j] == 1) {
				classToAdd = 'game-x'
			} else if (game.game[i][j] == 2) {
				classToAdd = 'game-o'
			}
			if (classToAdd) {
				document.getElementById(elId).classList.add(classToAdd);
			}
			console.log(i,j, elId);
			console.log(classToAdd);
		}
	}
};

const elementClicked = (ev) => {
	let i = ev.target.id[1];
	let j = ev.target.id[2];
	console.log('cl', i, j);
}

const initListeners = () => {
	document.querySelectorAll('.game-el').forEach(el => {
		el.addEventListener('click', elementClicked);
	});
};
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

let myParams = getQuery();
console.log('xxx' ,myParams);

let myGame;
if (myParams.id) {
	myGame = getGame(myParams.id);
} else {
	myGame = newGame();
}
myGame.then(game => {
	console.log('## myGame', game);
	initListeners();
	showGame(game);
});

/*
fetch(GAME_URL,
	{
		method : 'GET'
	})
	.then(r => {
		r.json().then(jsonBody => {
			console.log('###', jsonBody);
			getGame(jsonBody.id).then(g => { console.log('$$', g)});
		});

	});
	*/
