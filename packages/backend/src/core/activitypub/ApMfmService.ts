/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import * as mfm from 'mfm-js';
import { MfmService } from '@/core/MfmService.js';
import type { MiNote } from '@/models/Note.js';
import { bindThis } from '@/decorators.js';
import { extractApHashtagObjects } from './models/tag.js';
import type { IObject } from './type.js';

@Injectable()
export class ApMfmService {
	constructor(
		private mfmService: MfmService,
	) {
	}

	@bindThis
	public htmlToMfm(html: string, tag?: IObject | IObject[]): string {
		const hashtagNames = extractApHashtagObjects(tag).map(x => x.name);
		return this.mfmService.fromHtml(html, hashtagNames);
	}

	@bindThis
	public getNoteHtml(note: Pick<MiNote, 'text' | 'mentionedRemoteUsers'>, apAppend?: string) {
		let noMisskeyContent = false;
		const srcMfm = (note.text ?? '') + (apAppend ?? '');

		let md1 = srcMfm.replace(/\n[\#]{3}(.+)/g, '<h3>$1</h3>');
		let md2 = md1.replace(/\n[\#]{2}(.+)/g, '<h2>$1</h2>');
		let md3 = md2.replace(/\n[\#]{1}(.+)/g, '</h1>$1</h1>');
		const parsed = mfm.parse(md3);

		if (!apAppend && parsed?.every(n => ['text', 'unicodeEmoji', 'emojiCode', 'mention', 'hashtag', 'url'].includes(n.type))) {
			noMisskeyContent = true;
		}

		const content = this.mfmService.toHtml(parsed, JSON.parse(note.mentionedRemoteUsers));

		return {
			content,
			noMisskeyContent,
		};
	}
}
