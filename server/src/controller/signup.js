const User = require('../model/user');
const bcrypt = require('bcrypt');

const signup = async (req, res) => {
	// check inputs
	if (!req.body?.usr || !req.body?.passwd) {
		return res.status(400).json({ err: 'provided details are not complete' });
	}

	let response = await User.userExists(req.body.usr);
	if (!response) {
		return res.sedStatus(500);
	}
	// console.log(response[0]);
	if (response[0].length) {
		return res.status(400).json({ msg: 'this username already exists' });
	}

	const hash = await bcrypt.hash(req.body.passwd, 10);
	// console.log('hash', hash);
	response = await User.createUser(req.body.usr, hash);
	// console.log(response[0].affectedRows);
	if (!response[0]?.affectedRows) {
		return res.status(500).json({ msg: 'something went bad while signing up' });
	}

	res.json({ msg: 'account successfuly created' });
};

module.exports = signup;