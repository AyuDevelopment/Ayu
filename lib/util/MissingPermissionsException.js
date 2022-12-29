module.exports.MissingPermissionsException = class {
	message = "Missing permissions:";
	constructor(permissions) {}

	toString() {
		return `${this.message} ${this.permissions.join(", ")}`;
	}
}