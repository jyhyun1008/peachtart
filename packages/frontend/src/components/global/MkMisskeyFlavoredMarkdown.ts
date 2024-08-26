/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { VNode, h, SetupContext, provide } from 'vue';
import * as mfm from 'mfm-js';
import * as Misskey from 'misskey-js';
import MkUrl from '@/components/global/MkUrl.vue';
import MkTime from '@/components/global/MkTime.vue';
import MkLink from '@/components/MkLink.vue';
import MkMention from '@/components/MkMention.vue';
import MkEmoji from '@/components/global/MkEmoji.vue';
import MkCustomEmoji from '@/components/global/MkCustomEmoji.vue';
import MkCode from '@/components/MkCode.vue';
import MkCodeInline from '@/components/MkCodeInline.vue';
import MkGoogle from '@/components/MkGoogle.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import MkA, { MkABehavior } from '@/components/global/MkA.vue';
import { host } from '@/config.js';
import { defaultStore } from '@/store.js';
import { nyaize as doNyaize } from '@/scripts/nyaize.js';
import { safeParseFloat } from '@/scripts/safe-parse.js';

const QUOTE_STYLE = `
display: block;
margin: 8px;
padding: 6px 0 6px 12px;
color: var(--fg);
border-left: solid 3px var(--fg);
opacity: 0.7;
`.split('\n').join(' ');

type MfmProps = {
	text: string;
	plain?: boolean;
	nowrap?: boolean;
	author?: Misskey.entities.UserLite;
	isNote?: boolean;
	emojiUrls?: Record<string, string>;
	rootScale?: number;
	nyaize?: boolean | 'respect';
	parsedNodes?: mfm.MfmNode[] | null;
	enableEmojiMenu?: boolean;
	enableEmojiMenuReaction?: boolean;
	linkNavigationBehavior?: MkABehavior;
};

type MfmEvents = {
	clickEv(id: string): void;
};

// eslint-disable-next-line import/no-default-export
export default function (props: MfmProps, { emit }: { emit: SetupContext<MfmEvents>['emit'] }) {
	provide('linkNavigationBehavior', props.linkNavigationBehavior);

	const isNote = props.isNote ?? true;
	const shouldNyaize = props.nyaize ? props.nyaize === 'respect' ? props.author?.isCat : false : false;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (props.text == null || props.text === '') return;

	const rootAst = props.parsedNodes ?? (props.plain ? mfm.parseSimple : mfm.parse)(props.text);

	const validTime = (t: string | boolean | null | undefined) => {
		if (t == null) return null;
		if (typeof t === 'boolean') return null;
		return t.match(/^\-?[0-9.]+s$/) ? t : null;
	};

	const validColor = (c: unknown): string | null => {
		if (typeof c !== 'string') return null;
		return c.match(/^[0-9a-f]{3,6}$/i) ? c : null;
	};

	const useAnim = defaultStore.state.advancedMfm && defaultStore.state.animatedMfm;

	/**
	 * Gen Vue Elements from MFM AST
	 * @param ast MFM AST
	 * @param scale How times large the text is
	 * @param disableNyaize Whether nyaize is disabled or not
	 */
	const genEl = (ast: mfm.MfmNode[], scale: number, disableNyaize = false) => ast.map((token): VNode | string | (VNode | string)[] => {
		switch (token.type) {
			case 'text': {
				let text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n');
				if (!disableNyaize && shouldNyaize) {
					text = doNyaize(text);
				}

				if (!props.plain) {
					
					if (/\n\n\|([\s\S]+)\|\n\n/.test(text) || /^\|([\s\S]+)\|\n\n/.test(text) || /\n\n\|([\s\S]+)\|$/.test(text) || /^\|([\s\S]+)\|$/.test(text) ) {
						// var result = text.replace(/\|{5}/g, '</td><td colspan="5">')
						// result = result.replace(/\|{4}/g, '</td><td colspan="4">')
						// result = result.replace(/\|{3}/g, '</td><td colspan="3">')
						// result = result.replace(/\|{2}/g, '</td><td colspan="2">')
						// result = result.replace(/\|{1}/g, '</td><td>')
						// result = result.replace(/\<td\>\n(.+)\-{2,}(.+)\n\<\/td\>/g, '</tr></thead><tbody><tr>')
						// result = result.replace(/\<td\>\n\<\/td\>/g, '</tr><tr>')
						// result = result.replace(/^\<\/td\>/g, '<table style="border: 1px solid var(--accent); border-spacing: 0px;"><thead style="background: var(--bg); font-weight: bold;"><tr>')
						// result = result.replace(/\n\n\<\/td\>/g, '\n<table style="border: 1px solid var(--accent); border-spacing: 0px;"><thead style="background: var(--bg); font-weight: bold;"><tr>')
						// result = result.replace(/\<td\>\n\n/g, '</tr></tbody></table>\n')
						// result = result.replace(/\<td\>$/g, '</tr></tbody></table>')
						var result2: (VNode | string)[] = [];
						for (var r of text.split('\n')) {
							result2.push(h('br'));
							result2.push(h('span', {innerHTML: r}));
						}
						result2.shift();
						return result2;
					} else {
						const res: (VNode | string)[] = [];
						for (const t of text.split('\n')) {
							res.push(h('br'));
							res.push(h('span', {innerHTML: t}));
						}
						res.shift();
						return res;
					}
				} else {
					return [text.replace(/\n/g, ' ')];
				}
			}

			case 'bold': {
				return [h('b', genEl(token.children, scale))];
			}

			case 'strike': {
				return [h('del', genEl(token.children, scale))];
			}

			case 'italic': {
				return h('i', {
					style: 'font-style: oblique;',
				}, genEl(token.children, scale));
			}

			case 'fn': {
				// TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
				let style: string | undefined;
				switch (token.props.name) {
					case 'tada': {
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = 'font-size: 150%;' + (useAnim ? `animation: global-tada ${speed} linear infinite both; animation-delay: ${delay};` : '');
						break;
					}
					case 'jelly': {
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = (useAnim ? `animation: mfm-rubberBand ${speed} linear infinite both; animation-delay: ${delay};` : '');
						break;
					}
					case 'twitch': {
						const speed = validTime(token.props.args.speed) ?? '0.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-twitch ${speed} ease infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'shake': {
						const speed = validTime(token.props.args.speed) ?? '0.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-shake ${speed} ease infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'spin': {
						const direction =
							token.props.args.left ? 'reverse' :
							token.props.args.alternate ? 'alternate' :
							'normal';
						const anime =
							token.props.args.x ? 'mfm-spinX' :
							token.props.args.y ? 'mfm-spinY' :
							'mfm-spin';
						const speed = validTime(token.props.args.speed) ?? '1.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction}; animation-delay: ${delay};` : '';
						break;
					}
					case 'jump': {
						const speed = validTime(token.props.args.speed) ?? '0.75s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-jump ${speed} linear infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'bounce': {
						const speed = validTime(token.props.args.speed) ?? '0.75s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-bounce ${speed} linear infinite; transform-origin: center bottom; animation-delay: ${delay};` : '';
						break;
					}
					case 'flip': {
						const transform =
							(token.props.args.h && token.props.args.v) ? 'scale(-1, -1)' :
							token.props.args.v ? 'scaleY(-1)' :
							'scaleX(-1)';
						style = `transform: ${transform};`;
						break;
					}
					case 'x2': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x2' : '',
						}, genEl(token.children, scale * 2));
					}
					case 'x3': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x3' : '',
						}, genEl(token.children, scale * 3));
					}
					case 'x4': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x4' : '',
						}, genEl(token.children, scale * 4));
					}
					case 'font': {
						const family =
							token.props.args.serif ? '"HBIOS-SYS", serif' :
							token.props.args.monospace ? '"NeoDunggeunmo Code", monospace' :
							token.props.args.cursive ? '"DOSPilgiMedium", cursive' :
							token.props.args.fantasy ? '"Sam3KRFont", fantasy' :
							token.props.args.casual ? '"Ramche", serif' :
							token.props.args.emoji ? 'emoji' :
							token.props.args.math ? 'math' :
							null;
						if (family) style = `font-family: ${family};`;
						break;
					}
					case 'blur': {
						return h('span', {
							class: '_mfm_blur_',
						}, genEl(token.children, scale));
					}
					case 'rainbow': {
						if (!useAnim) {
							return h('span', {
								class: '_mfm_rainbow_fallback_',
							}, genEl(token.children, scale));
						}
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = `animation: mfm-rainbow ${speed} linear infinite; animation-delay: ${delay};`;
						break;
					}
					case 'gray': {
						return h('span', {
						class: '_mfm_gray',
						}, genEl(token.children, scale));
						}
					case 'sparkle': {
						if (!useAnim) {
							return genEl(token.children, scale);
						}
						return h(MkSparkle, {}, genEl(token.children, scale));
					}
					case 'rotate': {
						const degrees = safeParseFloat(token.props.args.deg) ?? 90;
						style = `transform: rotate(${degrees}deg); transform-origin: center center;`;
						break;
					}
					case 'position': {
						if (!defaultStore.state.advancedMfm) break;
						const x = safeParseFloat(token.props.args.x) ?? 0;
						const y = safeParseFloat(token.props.args.y) ?? 0;
						style = `transform: translateX(${x}em) translateY(${y}em);`;
						break;
					}
					case 'scale': {
						if (!defaultStore.state.advancedMfm) {
							style = '';
							break;
						}
						const x = Math.min(safeParseFloat(token.props.args.x) ?? 1, 5);
						const y = Math.min(safeParseFloat(token.props.args.y) ?? 1, 5);
						style = `transform: scale(${x}, ${y});`;
						scale = scale * Math.max(x, y);
						break;
					}
					case 'fg': {
						let color = validColor(token.props.args.color);
						color = color ?? 'f00';
						style = `color: #${color}; overflow-wrap: anywhere;`;
						break;
					}
					case 'bg': {
						let color = validColor(token.props.args.color);
						color = color ?? 'f00';
						style = `background-color: #${color}; overflow-wrap: anywhere;`;
						break;
					}
					case 'border': {
						let color = validColor(token.props.args.color);
						color = color ? `#${color}` : 'var(--accent)';
						let b_style = token.props.args.style;
						if (
							typeof b_style !== 'string' ||
							!['hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']
								.includes(b_style)
						) b_style = 'solid';
						const width = safeParseFloat(token.props.args.width) ?? 1;
						const radius = safeParseFloat(token.props.args.radius) ?? 0;
						style = `border: ${width}px ${b_style} ${color}; border-radius: ${radius}px;${token.props.args.noclip ? '' : ' overflow: clip;'}`;
						break;
					}
					case 'ruby': {
						if (token.children.length === 1) {
							const child = token.children[0];
							let text = child.type === 'text' ? child.props.text : '';
							if (!disableNyaize && shouldNyaize) {
								text = doNyaize(text);
							}
							return h('ruby', {}, [text.split(' ')[0], h('rt', text.split(' ')[1])]);
						} else {
							const rt = token.children.at(-1)!;
							let text = rt.type === 'text' ? rt.props.text : '';
							if (!disableNyaize && shouldNyaize) {
								text = doNyaize(text);
							}
							return h('ruby', {}, [...genEl(token.children.slice(0, token.children.length - 1), scale), h('rt', text.trim())]);
						}
					}
					case 'unixtime': {
						const child = token.children[0];
						const unixtime = parseInt(child.type === 'text' ? child.props.text : '');
						return h('span', {
							style: 'display: inline-block; font-size: 90%; border: solid 1px var(--divider); border-radius: 999px; padding: 4px 10px 4px 6px;',
						}, [
							h('i', {
								class: 'ti ti-clock',
								style: 'margin-right: 0.25em;',
							}),
							h(MkTime, {
								key: Math.random(),
								time: unixtime * 1000,
								mode: 'detail',
							}),
						]);
					}
					case 'clickable': {
						return h('span', { onClick(ev: MouseEvent): void {
							ev.stopPropagation();
							ev.preventDefault();
							const clickEv = typeof token.props.args.ev === 'string' ? token.props.args.ev : '';
							emit('clickEv', clickEv);
						} }, genEl(token.children, scale));
					}
				}
				if (style === undefined) {
					return h('span', {}, ['$[', token.props.name, ' ', ...genEl(token.children, scale), ']']);
				} else {
					return h('span', {
						style: 'display: inline-block; ' + style,
					}, genEl(token.children, scale));
				}
			}

			case 'small': {
				return [h('small', {
					style: 'opacity: 0.7;',
				}, genEl(token.children, scale))];
			}

			case 'center': {
				return [h('div', {
					style: 'text-align:center;',
				}, genEl(token.children, scale))];
			}

			case 'url': {
				return [h(MkUrl, {
					key: Math.random(),
					url: token.props.url,
					rel: 'nofollow noopener',
				})];
			}

			case 'link': {
				return [h(MkLink, {
					key: Math.random(),
					url: token.props.url,
					rel: 'nofollow noopener',
				}, genEl(token.children, scale, true))];
			}

			case 'mention': {
				return [h(MkMention, {
					key: Math.random(),
					host: (token.props.host == null && props.author && props.author.host != null ? props.author.host : token.props.host) ?? host,
					username: token.props.username,
				})];
			}

			case 'hashtag': {
				return [h(MkA, {
					key: Math.random(),
					to: isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/user-tags/${encodeURIComponent(token.props.hashtag)}`,
					style: 'color:var(--hashtag);',
				}, `#${token.props.hashtag}`)];
			}

			case 'blockCode': {
				return [h(MkCode, {
					key: Math.random(),
					code: token.props.code,
					lang: token.props.lang ?? undefined,
				})];
			}

			case 'inlineCode': {
				return [h(MkCodeInline, {
					key: Math.random(),
					code: token.props.code,
				})];
			}

			case 'quote': {
				if (!props.nowrap) {
					return [h('div', {
						style: QUOTE_STYLE,
					}, genEl(token.children, scale, true))];
				} else {
					return [h('span', {
						style: QUOTE_STYLE,
					}, genEl(token.children, scale, true))];
				}
			}

			case 'emojiCode': {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (props.author?.host == null) {
					return [h(MkCustomEmoji, {
						key: Math.random(),
						name: token.props.name,
						normal: props.plain,
						host: null,
						useOriginalSize: scale >= 2.5,
						menu: props.enableEmojiMenu,
						menuReaction: props.enableEmojiMenuReaction,
						fallbackToImage: false,
					})];
				} else {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (props.emojiUrls && (props.emojiUrls[token.props.name] == null)) {
						return [h('span', `:${token.props.name}:`)];
					} else {
						return [h(MkCustomEmoji, {
							key: Math.random(),
							name: token.props.name,
							url: props.emojiUrls && props.emojiUrls[token.props.name],
							normal: props.plain,
							host: props.author.host,
							useOriginalSize: scale >= 2.5,
						})];
					}
				}
			}

			case 'unicodeEmoji': {
				return [h(MkEmoji, {
					key: Math.random(),
					emoji: token.props.emoji,
					menu: props.enableEmojiMenu,
					menuReaction: props.enableEmojiMenuReaction,
				})];
			}

			case 'mathInline': {
				return [h('code', token.props.formula)];
			}

			case 'mathBlock': {
				return [h('code', token.props.formula)];
			}

			case 'search': {
				return [h(MkGoogle, {
					key: Math.random(),
					q: token.props.query,
				})];
			}

			case 'plain': {
				return [h('span', genEl(token.children, scale, true))];
			}

			default: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				console.error('unrecognized ast type:', (token as any).type);

				return [];
			}
		}
	}).flat(Infinity) as (VNode | string)[];

	function minmark(text: string) {

		text = '<br>'+text

		text = text.replace(/\<br\>/gm, '\n')

		if (/\n\n\|([\s\S]+)\|\n\n/.test(text) || /^\|([\s\S]+)\|\n\n/.test(text) || /\n\n\|([\s\S]+)\|$/.test(text) || /^\|([\s\S]+)\|$/.test(text) ) {
			text = text.replace(/\|{5}/g, '</td><td colspan="5">')
			text = text.replace(/\|{4}/g, '</td><td colspan="4">')
			text = text.replace(/\|{3}/g, '</td><td colspan="3">')
			text = text.replace(/\|{2}/g, '</td><td colspan="2">')
			text = text.replace(/\|{1}/g, '</td><td>')
			text = text.replace(/\<td\>\n(.+)\-{2,}(.+)\n\<\/td\>/g, '</tr></thead><tbody><tr>')
			text = text.replace(/\<td\>\n\<\/td\>/g, '</tr><tr>')
			text = text.replace(/\n\<\/td\>/g, '<br><span><table style="border: 1px solid var(--accent); border-spacing: 0px;"><thead style="background: var(--bg); font-weight: bold;"><tr>')
			text = text.replace(/\<td\>\n\n\>/g, '</tr></tbody></table>\n')
			text = text.replace(/\<td\>$/g, '</tr></tbody></table>')
		}
		
		//ul
		text = text.replace(/\>[\s]{0,1}\*\s/gm, '><ul><li>');
		text = text.replace(/\>(\*\s[^\n]+)\<\!\-\-\s\-\-\>\n/gm, '>$1</li></ul><!-- -->\n');
		text = text.replace(/\<\/ul\>\<\!\-\-\s\-\-\>\n\<\!\-\-\s\-\-\>\<ul\>/gm, '<!-- --><br/><!-- -->');

		//ul
		text = text.replace(/\>[\s]{0,1}\-\s/gm, '><ul><li>');
		text = text.replace(/\>(\-\s[^\n]+)\<\!\-\-\s\-\-\>\n/gm, '>$1</li></ul><!-- -->\n');
		text = text.replace(/\<\/ul\>\<\!\-\-\s\-\-\>\n\<\!\-\-\s\-\-\>\<ul\>/gm, '<!-- --><br/><!-- -->');

		//ol
		text = text.replace(/\>[\s]{0,1}\d\.\s/gm, '><ol><li>');
		text = text.replace(/\>(\d\.\s[^\n]+)\<\!\-\-\s\-\-\>\n/gm, '>$1</li></ol><!-- -->\n');
		text = text.replace(/\<\/ol\>\<\!\-\-\s\-\-\>\n\<\!\-\-\s\-\-\>\<ol\>/gm, '<!-- --><br/><!-- -->');

		//h
		text = text.replace(/\<br\>[\#]{3}\s(.+)/gm, '<br><h3>$1</h3>');
		text = text.replace(/\<br\>[\#]{2}\s(.+)/gm, '<br><h2>$1</h2>');
		text = text.replace(/\<br\>[\#]{1}\s(.+)/gm, '<br><h1>$1</h1>');

		//hr
		text = text.replace(/\<br\>[\-]{3}/g, '<hr>');

		//br
		// text = text.replace(/\>\n\n/gm, '><br><')
		// text = text.replace(/\>\n\</gm, '><')

		return text.substring(4)
	}


	let result = h('span', {
		// https://codeday.me/jp/qa/20190424/690106.html
		style: props.nowrap ? 'white-space: pre; word-wrap: normal; overflow: hidden; text-overflow: ellipsis;' : 'white-space: pre-wrap;',
	}, genEl(rootAst, props.rootScale ?? 1));

	let resultplain = ''

	if (result.children) {
		for (var i=0; i<result.children.length; i++) {
			if (result.children[i].type == 'br' || !result.children[i].props){
				resultplain += '<br><!-- -->'
			} else if (result.children[i].props) {
				if (result.children[i].props.innerHTML) {
					resultplain += result.children[i].props.innerHTML + '<!-- -->'
				} else if (result.children[i].props.emoji) {
					resultplain += result.children[i].props.emoji + '<!-- -->'
				} else {
					resultplain += '<!-- -->'
				}
			}
		}
	}

	console.log(resultplain)
	let resultarray = minmark(resultplain).split('<!-- -->')

	console.log(minmark(resultplain))

	if (result.children) {
		for (var i=0; i<result.children.length; i++) {
			if (result.children[i].type != 'br' && result.children[i].props){
				if (result.children[i].props.innerHTML) {
					result.children[i].props.innerHTML = resultarray[i]
				} else if (result.children[i].props.emoji) {
					result.children[i].props.emoji = resultarray[i]
				}
			}
			if (resultarray[i] == '<br/>') {
				result.children.splice(i, 1)
				i--;
			}
		}
	}

	return result
}
