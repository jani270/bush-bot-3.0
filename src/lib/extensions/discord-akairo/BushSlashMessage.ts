import { AkairoMessage } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';
import { BushClient, BushCommandUtil, BushGuild, BushUser } from '..';

export class BushSlashMessage extends AkairoMessage {
	public declare client: BushClient;
	public declare util: BushCommandUtil;
	public declare guild: BushGuild;
	public declare author: BushUser;
	public constructor(
		client: BushClient,
		interaction: CommandInteraction,
		{ slash, replied }: { slash?: boolean; replied?: boolean }
	) {
		super(client, interaction, { slash, replied });
	}
}
