import { DeleteButton, type BushMessage, type BushSlashMessage } from '#lib';
import { CommandUtil } from 'discord-akairo';
import {
	ActionRow,
	ActionRowComponent,
	ButtonComponent,
	ButtonStyle,
	ComponentType,
	MessageEmbed,
	type MessageComponentInteraction,
	type MessageEmbedOptions
} from 'discord.js';

/**
 * Sends multiple embeds with controls to switch between them
 */
export class ButtonPaginator {
	/**
	 * The message that triggered the command
	 */
	protected message: BushMessage | BushSlashMessage;

	/**
	 * The embeds to paginate
	 */
	protected embeds: MessageEmbed[] | MessageEmbedOptions[];

	/**
	 * The optional text to send with the paginator
	 */
	protected text: string | null;

	/**
	 * Whether the paginator message gets deleted when the exit button is pressed
	 */
	protected deleteOnExit: boolean;

	/**
	 * The current page of the paginator
	 */
	protected curPage: number;

	/**
	 * The paginator message
	 */
	protected sentMessage: BushMessage | undefined;

	/**
	 * @param message The message to respond to
	 * @param embeds The embeds to switch between
	 * @param text The text send with the embeds (optional)
	 * @param deleteOnExit Whether to delete the message when the exit button is clicked (defaults to true)
	 * @param startOn The page to start from (**not** the index)
	 */
	protected constructor(
		message: BushMessage | BushSlashMessage,
		embeds: MessageEmbed[] | MessageEmbedOptions[],
		text: string | null,
		deleteOnExit: boolean,
		startOn: number
	) {
		this.message = message;
		this.embeds = embeds;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		this.text = text || null;
		this.deleteOnExit = deleteOnExit;
		this.curPage = startOn - 1;

		// add footers
		for (let i = 0; i < embeds.length; i++) {
			if (embeds[i] instanceof MessageEmbed) {
				(embeds[i] as MessageEmbed).setFooter({ text: `Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}` });
			} else {
				(embeds[i] as MessageEmbedOptions).footer = {
					text: `Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}`
				};
			}
		}
	}

	/**
	 * The number of pages in the paginator
	 */
	protected get numPages(): number {
		return this.embeds.length;
	}

	/**
	 * Sends the paginator message
	 */
	protected async send() {
		this.sentMessage = (await this.message.util.reply({
			content: this.text,
			embeds: [this.embeds[this.curPage]],
			components: [this.getPaginationRow()]
		})) as BushMessage;

		const collector = this.sentMessage.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (i) => {
				const ret = i.customId.startsWith('paginate_') && i.message.id === this.sentMessage!.id;
				console.debug(ret);
				return ret;
			},
			idle: 300000
		});
		console.debug('got here');

		collector.on('collect', (i) => void this.collect(i));
		collector.on('end', () => void this.end());
	}

	/**
	 * Handles interactions with the paginator
	 * @param interaction The interaction received
	 */
	protected async collect(interaction: MessageComponentInteraction) {
		console.debug(1);
		if (interaction.user.id !== this.message.author.id && !client.config.owners.includes(interaction.user.id))
			return await interaction?.deferUpdate(); /* .catch(() => null); */

		switch (interaction.customId) {
			case 'paginate_beginning':
				this.curPage = 0;
				await this.edit(interaction);
				break;
			case 'paginate_back':
				this.curPage--;
				await this.edit(interaction);
				break;
			case 'paginate_stop':
				if (this.deleteOnExit) {
					await interaction.deferUpdate(); /* .catch(() => null); */
					await this.sentMessage!.delete(); /* .catch(() => null); */
					break;
				} else {
					await interaction?.update({
						content: `${this.text ? `${this.text}\n` : ''}Command closed by user.`,
						embeds: [],
						components: []
					});
					/* .catch(() => null); */
					break;
				}
			case 'paginate_next':
				this.curPage++;
				await this.edit(interaction);
				break;
			case 'paginate_end':
				this.curPage = this.embeds.length - 1;
				await this.edit(interaction);
				break;
		}
	}

	/**
	 * Ends the paginator
	 */
	protected async end() {
		if (this.sentMessage && !CommandUtil.deletedMessages.has(this.sentMessage.id))
			await this.sentMessage.edit({
				content: this.text,
				embeds: [this.embeds[this.curPage]],
				components: [this.getPaginationRow(true)]
			});
		/* .catch(() => null); */
	}

	/**
	 * Edits the paginator message
	 * @param interaction The interaction received
	 */
	protected async edit(interaction: MessageComponentInteraction) {
		await interaction?.update({
			content: this.text,
			embeds: [this.embeds[this.curPage]],
			components: [this.getPaginationRow()]
		});
		/* .catch(() => null); */
	}

	/**
	 * Generates the pagination row based on the class properties
	 * @param disableAll Whether to disable all buttons
	 * @returns The generated {@link ActionRow}
	 */
	protected getPaginationRow(disableAll = false): ActionRow<ActionRowComponent> {
		return new ActionRow().addComponents(
			new ButtonComponent()
				.setStyle(ButtonStyle.Primary)
				.setCustomId('paginate_beginning')
				.setEmoji(PaginateEmojis.BEGINNING)
				.setDisabled(disableAll || this.curPage === 0),
			new ButtonComponent()
				.setStyle(ButtonStyle.Primary)
				.setCustomId('paginate_back')
				.setEmoji(PaginateEmojis.BACK)
				.setDisabled(disableAll || this.curPage === 0),
			new ButtonComponent()
				.setStyle(ButtonStyle.Primary)
				.setCustomId('paginate_stop')
				.setEmoji(PaginateEmojis.STOP)
				.setDisabled(disableAll),
			new ButtonComponent()
				.setStyle(ButtonStyle.Primary)
				.setCustomId('paginate_next')
				.setEmoji(PaginateEmojis.FORWARD)
				.setDisabled(disableAll || this.curPage === this.embeds.length - 1),
			new ButtonComponent()
				.setStyle(ButtonStyle.Primary)
				.setCustomId('paginate_end')
				.setEmoji(PaginateEmojis.END)
				.setDisabled(disableAll || this.curPage === this.embeds.length - 1)
		);
	}

	/**
	 * Sends multiple embeds with controls to switch between them
	 * @param message The message to respond to
	 * @param embeds The embeds to switch between
	 * @param text The text send with the embeds (optional)
	 * @param deleteOnExit Whether to delete the message when the exit button is clicked (defaults to true)
	 * @param startOn The page to start from (**not** the index)
	 */
	public static async send(
		message: BushMessage | BushSlashMessage,
		embeds: MessageEmbed[] | MessageEmbedOptions[],
		text: string | null = null,
		deleteOnExit = true,
		startOn = 1
	) {
		// no need to paginate if there is only one page
		if (embeds.length === 1) return DeleteButton.send(message, { embeds: embeds });

		return await new ButtonPaginator(message, embeds, text, deleteOnExit, startOn).send();
	}
}

export const PaginateEmojis = {
	BEGINNING: { id: '853667381335162910', name: 'w_paginate_beginning', animated: false } as const,
	BACK: { id: '853667410203770881', name: 'w_paginate_back', animated: false } as const,
	STOP: { id: '853667471110570034', name: 'w_paginate_stop', animated: false } as const,
	FORWARD: { id: '853667492680564747', name: 'w_paginate_next', animated: false } as const,
	END: { id: '853667514915225640', name: 'w_paginate_end', animated: false } as const
} as const;
