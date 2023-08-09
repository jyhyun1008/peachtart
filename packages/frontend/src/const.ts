// ブラウザで直接表示することを許可するファイルの種類のリスト
// ここに含まれないものは application/octet-stream としてレスポンスされる
// SVGはXSSを生むので許可しない
export const FILE_TYPE_BROWSERSAFE = [
	// Images
	'image/png',
	'image/gif',
	'image/jpeg',
	'image/webp',
	'image/avif',
	'image/apng',
	'image/bmp',
	'image/tiff',
	'image/x-icon',

	// OggS
	'audio/opus',
	'video/ogg',
	'audio/ogg',
	'application/ogg',

	// ISO/IEC base media file format
	'video/quicktime',
	'video/mp4',
	'audio/mp4',
	'video/x-m4v',
	'audio/x-m4a',
	'video/3gpp',
	'video/3gpp2',

	'video/mpeg',
	'audio/mpeg',

	'video/webm',
	'audio/webm',

	'audio/aac',

	// see https://github.com/misskey-dev/misskey/pull/10686
	'audio/flac',
	'audio/wav',
	// backward compatibility
	'audio/x-flac',
	'audio/vnd.wave',
];
/*
https://github.com/sindresorhus/file-type/blob/main/supported.js
https://github.com/sindresorhus/file-type/blob/main/core.js
https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
*/

export const notificationTypes = ['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'achievementEarned', 'app'] as const;
export const obsoleteNotificationTypes = ['pollVote', 'groupInvited'] as const;

export const ROLE_POLICIES = [
	'gtlAvailable',
	'ltlAvailable',
	'canPublicNote',
	'canInvite',
	'inviteLimit',
	'inviteLimitCycle',
	'inviteExpirationTime',
	'canManageCustomEmojis',
	'canSearchNotes',
	'canHideAds',
	'driveCapacityMb',
	'alwaysMarkNsfw',
	'pinLimit',
	'antennaLimit',
	'wordMuteLimit',
	'webhookLimit',
	'clipLimit',
	'noteEachClipsLimit',
	'userListLimit',
	'userEachUserListsLimit',
	'rateLimitFactor',
] as const;

// なんか動かない
//export const CURRENT_STICKY_TOP = Symbol('CURRENT_STICKY_TOP');
//export const CURRENT_STICKY_BOTTOM = Symbol('CURRENT_STICKY_BOTTOM');
export const CURRENT_STICKY_TOP = 'CURRENT_STICKY_TOP';
export const CURRENT_STICKY_BOTTOM = 'CURRENT_STICKY_BOTTOM';

export const DEFAULT_SERVER_ERROR_IMAGE_URL = 'https://peachtart2.s3.ap-northeast-1.amazonaws.com/tart/39f07d6e-8688-4f54-8b55-18e6c1a7d348.png';
export const DEFAULT_NOT_FOUND_IMAGE_URL = 'https://peachtart2.s3.ap-northeast-1.amazonaws.com/tart/7139c9d2-5906-4337-9c79-035295eb5859.webp';
export const DEFAULT_INFO_IMAGE_URL = 'https://peachtart2.s3.ap-northeast-1.amazonaws.com/tart/3be24f47-92fa-42de-bff7-f55b324c5bde.webp';
