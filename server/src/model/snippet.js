const pool = require('./db');

const poolPromise = (query) =>
	pool
		.execute(query)
		.then((res) => res)
		.catch((err) => err);

const getSnippets = (usr) => poolPromise(`select * from snippets where user = '${usr}'`);
const getSnippet = (usr, snipID) => poolPromise(`select * from snippets where user = '${usr}' and id = '${snipID}'`);
const deleteSnippet = (usr, snipID) => poolPromise(`delete from snippets where user = '${usr}' and id = '${snipID}'`);
const createSnippet = (usr, props) =>
	poolPromise(`INSERT INTO
        snippets (user, isPrivate, coworkers, img, title, descr, snippet)
        VALUES (${props.user}, ${props.isPrivate},
                ${props.coworkers}, ${props.img},
                ${props.title}, ${props.descr}, ${props.snippet})`);
const editSnippet = (owner, props) =>
	poolPromise(`UPDATE
            snippets SET title='${props.title}',
                        descr='${props.descr}',
                        snippet='${props.snippet}'
            WHERE user = '${owner}' AND id = '${props.id}';`);

module.exports = {
	getSnippets,
	getSnippet,
	createSnippet,
	deleteSnippet,
	editSnippet,
};