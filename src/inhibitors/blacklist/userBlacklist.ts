import { BushInhibitor } from '../../lib/extensions/BushInhibitor';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushMessage } from '../../lib/extensions/BushMessage';

export default class UserBlacklistInhibitor extends BushInhibitor {
	constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.author) return false;
		if (this.client.isOwner(message.author) || this.client.isSuperUser(message.author)) return false;
		return this.client.cache.global.blacklistedUsers.includes(message.author.id);
	}
}
