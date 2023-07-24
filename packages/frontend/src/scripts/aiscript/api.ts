import { utils, values } from '@syuilo/aiscript';
import * as os from '@/os';
import { $i } from '@/account';
import { miLocalStorage } from '@/local-storage';
import { customEmojis } from '@/custom-emojis';
import * as sound from '@/scripts/sound';

var latitude = 0, longitude = 0
navigator.geolocation.getCurrentPosition(function(pos) {
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
});

function geolat(bool) {
	if (bool) {
		return latitude;
	} else {
		return 0
	}
}

function geolon(bool) {
	if (bool) {
		return longitude;
	} else {
		return 0
	}
}

export function createAiScriptEnv(opts) {
	let apiRequests = 0;
	return {
		USER_ID: $i ? values.STR($i.id) : values.NULL,
		USER_NAME: $i ? values.STR($i.name) : values.NULL,
		USER_USERNAME: $i ? values.STR($i.username) : values.NULL,
		CUSTOM_EMOJIS: utils.jsToVal(customEmojis.value),
		CURRENT_URL: values.STR(window.location.href),
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
		'Date:getTime': values.FN_NATIVE(([year, month, day, hour, minute, second, ms]) => {
			utils.assertNumber(year);
			if (month.type !== 'num') {month = 0} else {month = month.value};
			if (day.type !== 'num') {day = 0} else {day = day.value};
			if (hour.type !== 'num') {hour = 0} else {hour = hour.value};
			if (minute.type !== 'num') {minute = 0} else {minute = minute.value};
			if (second.type !== 'num') {second = 0} else {second = second.value};
			if (ms.type !== 'num') {ms = 0} else {ms = ms.value};
			var result = new Date(year.value, month, day, hour, minute, second, ms).getTime();
			return values.NUM(result);
		}),
		'Date:daysFromEpoch': values.FN_NATIVE(([num]) => {
			utils.assertNumber(num);
			return values.NUM(Math.floor((num.value + 32400000) / 86400000));
		}),
		'Date:dayOfYear': values.FN_NATIVE(([num]) => {
			utils.assertNumber(num);
			const currentYear  = new Date().getFullYear();
			const currentYearMs = new Date(currentYear, 0, 0).getTime();
			return values.NUM(Math.floor((num.value - currentYearMs) / 1000 / 60 / 60 / 24));
		}),
		'Mk:geolat': values.FN_NATIVE(([bool]) => {
			utils.assertBoolean(bool);
			return values.NUM(geolat(bool.value));
		}),
		'Mk:geolon': values.FN_NATIVE(([bool]) => {
			utils.assertBoolean(bool);
			return values.NUM(geolon(bool.value));
		}),
		'Mk:encode': values.FN_NATIVE(([text]) => {
			utils.assertString(text);
			return values.STR(btoa(text.value));
		}),
		'Mk:decode': values.FN_NATIVE(([base64]) => {
			utils.assertString(base64);
			return values.STR(atob(base64.value));
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
			if (token) {
				utils.assertString(token);
				// バグがあればundefinedもあり得るため念のため
				if (typeof token.value !== 'string') throw new Error('invalid token');
			}
			apiRequests++;
			if (apiRequests > 16) return values.NULL;
			const res = await os.api(ep.value, utils.valToJs(param), token ? token.value : (opts.token ?? null));
			return utils.jsToVal(res);
		}),
		'Mk:save': values.FN_NATIVE(([key, value]) => {
			utils.assertString(key);
			miLocalStorage.setItem(`aiscript:${opts.storageKey}:${key.value}`, JSON.stringify(utils.valToJs(value)));
			return values.NULL;
		}),
		'Mk:load': values.FN_NATIVE(([key]) => {
			utils.assertString(key);
			return utils.jsToVal(JSON.parse(miLocalStorage.getItem(`aiscript:${opts.storageKey}:${key.value}`)));
		}),
	};
}
