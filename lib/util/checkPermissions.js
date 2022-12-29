const { Message, PermissionResolvable } = require('discord.js')

/**
	* @param {Message} message
*/
module.exports.checkPermissions = async function (command, message) {
	const member = await message.guild.members.fetch({ user: message.client.user.id });
	
	/**
		* @type {PermissionResolvable[]}
	*/
	const requiredPermissions = command.permissions;

	if (!command.permissions) return { result: true };

	const missing = member.permissions.missing(requiredPermissions);

	if (missing.length) return { result: false, missing };
	return { result: true }
}