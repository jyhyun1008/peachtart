/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { VNode, h, SetupContext, provide } from 'vue';
import * as mfm from 'mfm-js';
import * as Misskey from 'misskey-js';
import { host } from '@@/js/config.js';
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
import { defaultStore } from '@/store.js';

function safeParseFloat(str: unknown): number | null {
	if (typeof str !== 'string' || str === '') return null;
	const num = parseFloat(str);
	if (isNaN(num)) return null;
	return num;
}

const QUOTE_STYLE = `
display: block;
margin: 8px;
padding: 6px 0 6px 12px;
color: var(--MI_THEME-fg);
border-left: solid 3px var(--MI_THEME-fg);
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
	// こうしたいところだけど functional component 内では provide は使えない
	//provide('linkNavigationBehavior', props.linkNavigationBehavior);

	const isNote = props.isNote ?? true;
	const shouldNyaize = props.nyaize ? props.nyaize === 'respect' ? props.author?.isCat : false : false;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (props.text == null || props.text === '') return;

	//ul
	props.text = props.text.replace(/^\*\s(.+)/gm, '<i>ul\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/\n\*\s(.+)/gm, '<i>ul\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/^\-\s(.+)/gm, '<i>ul\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/\n\-\s(.+)/gm, '<i>ul\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/\<\/i\>\n\<i\>ul\n/gm, '')

	//ol
	props.text = props.text.replace(/^\d\.\s(.+)/gm, '<i>ol\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/\n\d\.\s(.+)/gm, '<i>ol\n<i>li\n$1</i></i>')
	props.text = props.text.replace(/\<\/i\>\n\<i\>ol\n/gm, '')
	props.text = props.text.replace(/\<\/i\>\n/gm, '</i>')

	//table
	//표로 인식되는 행
	props.text = props.text.replace(/^\|(.+)\|$/gm, '<table>|$1|</table>')
	props.text = props.text.replace(/<table>[\s\S]*?<\/table>/g, (match) => {
		return match.replace(/\|/g, '</i><i>td1 ');
	});
	props.text = props.text.replace(/\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s/gm, '</i><i>td5 ')
	props.text = props.text.replace(/\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s/gm, '</i><i>td4 ')
	props.text = props.text.replace(/\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1/gm, '</i><i>td3 ')
	props.text = props.text.replace(/\<\/i\>\<i\>td1\s\<\/i\>\<i\>td1\s/gm, '</i><i>td2 ')
	//props.text = props.text.replace(/\|/gm, '</i><i>td1 ')
	props.text = props.text.replace(/\<i\>td1\s<\/table>\n<table>\<\/i\>\<i\>td1\s(.+)\-{2,}(.+)\<\/i\>\<i\>td1\s<\/table>\n<table>\<\/i\>/g, '</i></i><i>tbody <i>tr ')
	props.text = props.text.replace(/\<i\>td1\s<\/table>\n<table>\<\/i\>/g, '</i><i>tr ')
	props.text = props.text.replace(/^<table>\<\/i\>/gm, '<i>table <i>thead <i>tr ')
	props.text = props.text.replace(/\<i\>td1\s<\/table>$/gm, '</i></i></i>')
	props.text = props.text.replace(/\<i\>td1\s<\/table>\n<table>/g, '</i></i></i>')

	// hr
	props.text = props.text.replace(/^\-{3,}\n/gm, '<i>hr </i>')

	// h
	props.text = props.text.replace(/^\#{3}\s(.+)\n/gm, '<i>h3 $1</i>')
	props.text = props.text.replace(/^\#{2}\s(.+)\n/gm, '<i>h2 $1</i>')
	props.text = props.text.replace(/^\#{1}\s(.+)\n/gm, '<i>h1 $1</i>')

	const rootAst = (props.plain ? mfm.parseSimple : mfm.parse)(props.text);

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
					text = Misskey.nyaize(text);
				}

				if (!props.plain) {
					const res: (VNode | string)[] = [];
						for (const t of text.split('\n')) {
							res.push(h('br'));
							res.push(h('span', {innerHTML: t}));
						}
						res.shift();
						return res;
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
				if (token.children[0].props.text.includes('ul\n')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('ul', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('ol\n')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('ol', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('li\n')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('li', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('table ')) {
					token.children[0].props.text = token.children[0].props.text.substring(6)
					return h('table', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('thead ')) {
					token.children[0].props.text = token.children[0].props.text.substring(6)
					return h('thead', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('tbody ')) {
					token.children[0].props.text = token.children[0].props.text.substring(6)
					return h('tbody', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('tr ')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('tr', genEl(token.children, scale))
				} else if (/td\d\s/.test(token.children[0].props.text)) {
					let colspan = parseInt(token.children[0].props.text.split('td')[1].split(' ')[0])
					token.children[0].props.text = token.children[0].props.text.substring(4)
					return h('td', {
						colspan: colspan,
					}, genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('h3 ')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('h3', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('h2 ')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('h2', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('h1 ')) {
					token.children[0].props.text = token.children[0].props.text.substring(3)
					return h('h1', genEl(token.children, scale))
				} else if (token.children[0].props.text.includes('hr ')) {
					return h('hr')
				} else {
					return h('i', {
						style: 'font-style: oblique;',
					}, genEl(token.children, scale));
				}
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
						color = color ? `#${color}` : 'var(--MI_THEME-accent)';
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
								text = Misskey.nyaize(text);
							}
							return h('ruby', {}, [text.split(' ')[0], h('rt', text.split(' ')[1])]);
						} else {
							const rt = token.children.at(-1)!;
							let text = rt.type === 'text' ? rt.props.text : '';
							if (!disableNyaize && shouldNyaize) {
								text = Misskey.nyaize(text);
							}
							return h('ruby', {}, [...genEl(token.children.slice(0, token.children.length - 1), scale), h('rt', text.trim())]);
						}
					}
					case 'unixtime': {
						const child = token.children[0];
						const unixtime = parseInt(child.type === 'text' ? child.props.text : '');
						return h('span', {
							style: 'display: inline-block; font-size: 90%; border: solid 1px var(--MI_THEME-divider); border-radius: 999px; padding: 4px 10px 4px 6px;',
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
					navigationBehavior: props.linkNavigationBehavior,
				})];
			}

			case 'link': {
				return [h(MkLink, {
					key: Math.random(),
					url: token.props.url,
					rel: 'nofollow noopener',
					navigationBehavior: props.linkNavigationBehavior,
				}, genEl(token.children, scale, true))];
			}

			case 'mention': {
				return [h(MkMention, {
					key: Math.random(),
					host: (token.props.host == null && props.author && props.author.host != null ? props.author.host : token.props.host) ?? host,
					username: token.props.username,
					navigationBehavior: props.linkNavigationBehavior,
				})];
			}

			case 'hashtag': {
				return [h(MkA, {
					key: Math.random(),
					to: isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/user-tags/${encodeURIComponent(token.props.hashtag)}`,
					style: 'color:var(--MI_THEME-hashtag);',
					behavior: props.linkNavigationBehavior,
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
				// @ts-expect-error 存在しないASTタイプ
				console.error('unrecognized ast type:', token.type);

				return [];
			}
		}
	}).flat(Infinity) as (VNode | string)[];

	let result = h('span', {
		// https://codeday.me/jp/qa/20190424/690106.html
		style: props.nowrap ? 'white-space: pre; word-wrap: normal; overflow: hidden; text-overflow: ellipsis;' : 'white-space: pre-wrap;',
	}, genEl(rootAst, props.rootScale ?? 1));

	return result
}