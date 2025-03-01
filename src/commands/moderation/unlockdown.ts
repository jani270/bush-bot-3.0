import { LockdownCommand } from '#commands';
import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import { ApplicationCommandOptionType, Permissions } from 'discord.js';

export default class UnlockdownCommand extends BushCommand {
	public constructor() {
		super('unlockdown', {
			aliases: ['unlockdown', 'unlock', 'lockup'],
			category: 'moderation',
			description: 'Allows you to unlockdown a channel or all configured channels.',
			usage: ['unlockdown [channel] [reason] [--all]'],
			examples: ['unlockdown', 'unlockdown raid is over --all'],
			args: [
				{
					id: 'channel',
					description: 'Specify a different channel to unlockdown instead of the one you trigger the command in.',
					type: util.arg.union('textChannel', 'newsChannel', 'threadChannel'),
					prompt: 'What channel would you like to unlockdown?',
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: ['GuildText', 'GuildNews', 'GuildNewsThread', 'GuildPublicThread', 'GuildPrivateThread'],
					optional: true
				},
				{
					id: 'reason',
					description: 'The reason for the unlock.',
					type: 'string',
					match: 'rest',
					prompt: 'What is the reason for the unlock?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'all',
					description: 'Whether or not to unlock all configured channels.',
					match: 'flag',
					flag: '--all',
					prompt: 'Would you like to unlockdown all configured channels?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [Permissions.FLAGS.MANAGE_CHANNELS]),
			userPermissions: [Permissions.FLAGS.MANAGE_CHANNELS]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			channel: OptionalArgType<'textChannel'> | OptionalArgType<'newsChannel'> | OptionalArgType<'threadChannel'>;
			reason: OptionalArgType<'string'>;
			all: ArgType<'boolean'>;
		}
	) {
		return await LockdownCommand.lockdownOrUnlockdown(message, args, 'unlockdown');
	}
}
