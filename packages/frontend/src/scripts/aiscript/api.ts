/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { utils, values } from '@syuilo/aiscript';
import * as os from '@/os.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { $i } from '@/account.js';
import { miLocalStorage } from '@/local-storage.js';
import { customEmojis } from '@/custom-emojis.js';
import { url, lang } from '@/config.js';
import { nyaize } from '@/scripts/nyaize.js';
import * as sound from '@/scripts/sound.js';
import { io } from "socket.io-client";

// 사전 선언.

var socket = io();

//var latitude = 0, longitude = 0
//navigator.geolocation.getCurrentPosition(function(pos) {
//  latitude = pos.coords.latitude;
//  longitude = pos.coords.longitude;
//});

//function geolat(bool) {
//	if (bool) {
//		return latitude;
//	} else {
//		return 0
//	}
//}

//function geolon(bool) {
//	if (bool) {
//		return longitude;
//	} else {
//		return 0
//	}
//}



// 이제부터 함수.

export function aiScriptReadline(q: string): Promise<string> {
	return new Promise(ok => {
		os.inputText({
			title: q,
		}).then(({ result: a }) => {
			ok(a ?? '');
		});
	});
}

export function createAiScriptEnv(opts) {
	return {
		USER_ID: $i ? values.STR($i.id) : values.NULL,
		USER_NAME: $i ? values.STR($i.name) : values.NULL,
		USER_USERNAME: $i ? values.STR($i.username) : values.NULL,
		CUSTOM_EMOJIS: utils.jsToVal(customEmojis.value),
		CURRENT_URL: values.STR(window.location.href),
		LOCALE: values.STR(lang),
		SERVER_URL: values.STR(url),
		'Mk:clipboard': values.FN_NATIVE(([str]) => {
			utils.assertString(str);
			navigator.clipboard.writeText(str.value)
			.then(() => {
				os.alert({
					type: 'info',
					title: '클립보드',
					text: '클립보드에 저장되었습니다.',
				});
			})
			.catch(err => {
				os.alert({
					type: 'info',
					title: '클립보드',
					text: '클립보드 저장에 실패하였습니다.',
				});
			})
		}),
		'Str:regExReplace': values.FN_NATIVE(([str, regEx, replace]) => {
			utils.assertString(str);
			utils.assertString(regEx);
			utils.assertString(replace);
			regEx = new RegExp(regEx.value, 'gm');
			return values.STR(str.value.replace(regEx, replace.value))
		}),
		'Str:URIReplace': values.FN_NATIVE(([str]) => {
			utils.assertString(str);
			var regEx = new RegExp('\(https\:\/\/([^\)]+)\)', 'gm');
			return values.STR(str.value.replace(regEx, encodeURI))
		}),
		'Str:encodeURI': values.FN_NATIVE(([url]) => {
			utils.assertString(url);
			return values.STR(encodeURI(url.value))
		}),
		'Mk:fetchMd': values.FN_NATIVE(async([githubUserName, repoName, branchName, fileName]) => {
			utils.assertString(githubUserName);
			utils.assertString(repoName);
			utils.assertString(branchName);
			utils.assertString(fileName);
			var url = "https://raw.githubusercontent.com/"+githubUserName.value+"/"+repoName.value+"/"+branchName.value+"/"+fileName.value+".md"
			var response = await fetch(url)
			var markdown = await response.text();
			return values.STR(markdown)
		}),
		'Mk:keyDown': values.FN_NATIVE(([key, fn], opts) => {
			utils.assertNumber(key);
			utils.assertFunction(fn);
			window.addEventListener("keydown", async (e) => {
				if (e.keyCode == key.value && (e.ctrlKey || e.metaKey)) {
					e.preventDefault();
					await opts.call(fn)
				}
			})
		}),
		'Str:parseFloat': values.FN_NATIVE(([str]) => {
			utils.assertString(str);
			return values.NUM(parseFloat(str.value));
		}),
		'Mk:audio': values.FN_NATIVE(([file]) => {
			utils.assertString(file);
			const audio = sound.setVolume(sound.getAudio(file.value), 1);
			audio.play();
		}),
		'Math:toFixed': values.FN_NATIVE(([num, tofixed]) => {
			utils.assertNumber(num);
			utils.assertNumber(tofixed);
			return values.NUM(num.value.toFixed(tofixed.value));
		}),
		'Date:weekDay': values.FN_NATIVE(([date]) => {
			utils.assertNumber(date);
			var result = new Date(date.value).getDay();
			return values.NUM(result);
		}),
		'Date:getTime': values.FN_NATIVE(([year, month, day, hour, minute, second, ms]) => {
			utils.assertNumber(year);
			if (!month) {month = 0} else if (month.type !== 'num') {month = 0} else {month = month.value};
			if (!day) {day = 0} else if (day.type !== 'num') {day = 0} else {day = day.value};
			if (!hour) {hour = 0} else if (hour.type !== 'num') {hour = 0} else {hour = hour.value};
			if (!minute) {minute = 0} else if (minute.type !== 'num') {minute = 0} else {minute = minute.value};
			if (!second) {second = 0} else if (second.type !== 'num') {second = 0} else {second = second.value};
			if (!ms) {ms = 0} else if (ms.type !== 'num') {ms = 0} else {ms = ms.value};
			var result = new Date(year.value, month, day, hour, minute, second, ms).getTime();
			return values.NUM(result);
		}),
		'Date:daysFromEpoch': values.FN_NATIVE(([num]) => {
			utils.assertNumber(num);
			const epoch = new Date(1970, 0, 1).getTime();
			return values.NUM(Math.floor((num.value - epoch) / 86400000));
		}),
		'Date:dayOfYear': values.FN_NATIVE(([num]) => {
			utils.assertNumber(num);
			const currentYear  = new Date(num.value).getFullYear();
			const currentYearMs = new Date(currentYear, 0, 0).getTime();
			return values.NUM(Math.floor((num.value - currentYearMs) / 1000 / 60 / 60 / 24));
		}),
		//'Mk:geolat': values.FN_NATIVE(([bool]) => {
		//	utils.assertBoolean(bool);
		//	return values.NUM(geolat(bool.value));
		//}),
		//'Mk:geolon': values.FN_NATIVE(([bool]) => {
		//	utils.assertBoolean(bool);
		//	return values.NUM(geolon(bool.value));
		//}),
		'Str:encodeB64': values.FN_NATIVE(([text]) => {
			utils.assertString(text);
			return values.STR(btoa(text.value));
		}),
		'Str:decodeB64': values.FN_NATIVE(([base64]) => {
			utils.assertString(base64);
			return values.STR(atob(base64.value));
		}),
		'Mk:encode': values.FN_NATIVE(([text]) => {
			utils.assertString(text);
			return values.STR(btoa(text.value));
		}),
		'Mk:decode': values.FN_NATIVE(([base64]) => {
			utils.assertString(base64);
			return values.STR(atob(base64.value));
		}),
		'Mk:open_page': values.FN_NATIVE(([url]) => {
			utils.assertString(url);
			os.pageWindow(url.value);
		}),
		'Mk:open_url': values.FN_NATIVE(([url]) => {
			utils.assertString(url);
			window.open(url.value, '_blank');
		}),
		'Mk:move_url': values.FN_NATIVE(([url]) => {
			utils.assertString(url);
			window.open(url.value, '_top');
		}),
		'Mk:dialog': values.FN_NATIVE(async ([title, text, type]) => {
			await os.alert({
				type: type ? type.value : 'info',
				title: title.value,
				text: text.value,
			});
			return values.NULL;
		}),
		'Mk:confirm': values.FN_NATIVE(async ([title, text, type]) => {
			const confirm = await os.confirm({
				type: type ? type.value : 'question',
				title: title.value,
				text: text.value,
			});
			return confirm.canceled ? values.FALSE : values.TRUE;
		}),
		'Mk:api': values.FN_NATIVE(async ([ep, param, token]) => {
			utils.assertString(ep);
			if (ep.value.includes('://')) throw new Error('invalid endpoint');
			if (token) {
				utils.assertString(token);
				// バグがあればundefinedもあり得るため念のため
				if (typeof token.value !== 'string') throw new Error('invalid token');
			}
			const actualToken: string|null = token?.value ?? opts.token ?? null;
			return misskeyApi(ep.value, utils.valToJs(param), actualToken).then(res => {
				return utils.jsToVal(res);
			}, err => {
				return values.ERROR('request_failed', utils.jsToVal(err));
			});
		}),
		/* セキュリティ上の問題があるため無効化
		'Mk:apiExternal': values.FN_NATIVE(async ([host, ep, param, token]) => {
			utils.assertString(host);
			utils.assertString(ep);
			if (token) utils.assertString(token);
			return os.apiExternal(host.value, ep.value, utils.valToJs(param), token?.value).then(res => {
				return utils.jsToVal(res);
			}, err => {
				return values.ERROR('request_failed', utils.jsToVal(err));
			});
		}),
		*/
		'Mk:save': values.FN_NATIVE(([key, value]) => {
			utils.assertString(key);
			miLocalStorage.setItem(`aiscript:${opts.storageKey}:${key.value}`, JSON.stringify(utils.valToJs(value)));
			return values.NULL;
		}),
		'Mk:load': values.FN_NATIVE(([key]) => {
			utils.assertString(key);
			return utils.jsToVal(JSON.parse(miLocalStorage.getItem(`aiscript:${opts.storageKey}:${key.value}`)));
		}),
		'Mk:url': values.FN_NATIVE(() => {
			return values.STR(window.location.href);
		}),
		'Mk:nyaize': values.FN_NATIVE(([text]) => {
			utils.assertString(text);
			return values.STR(nyaize(text.value));
		}),
		'Mk:ioConnect': values.FN_NATIVE(([url, arr]) => {
			utils.assertString(url);
			socket = io.connect(url.value, {transports: ['websocket']});
		}),
		'Mk:socketEmit': values.FN_NATIVE(([event, param]) => {
			utils.assertString(event);
			socket.emit(event.value, utils.valToJs(param));
			console.log(event.value)
		}),
		'Mk:socketOn': values.FN_NATIVE(([event, fn], opts) => {
			utils.assertString(event);
			utils.assertFunction(fn);
			socket.on(event.value, async (res) => {
				console.log(res)
				console.log(event.value)
				await opts.call(fn, [utils.jsToVal(res)])
			});
		}),
		'Mk:beforeUnload': values.FN_NATIVE(([fn], opts) => {
			utils.assertFunction(fn);
			window.addEventListener('beforeunload', async ( ) => {
				await opts.call(fn)
			});
		}),
		'Mk:Unload': values.FN_NATIVE(([fn], opts) => {
			utils.assertFunction(fn);
			window.addEventListener('unload', async ( ) => {
				await opts.call(fn)
			});
		}),
	};
}
