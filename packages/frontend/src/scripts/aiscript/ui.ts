/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { utils, values } from '@syuilo/aiscript';
import { v4 as uuid } from 'uuid';
import { ref, Ref } from 'vue';
import * as Misskey from 'misskey-js';

export type AsUiComponentBase = {
	id: string;
	hidden?: boolean;
};

export type AsUiRoot = AsUiComponentBase & {
	type: 'root';
	children: AsUiComponent['id'][];
};

export type AsUiContainer = AsUiComponentBase & {
	type: 'container';
	children?: AsUiComponent['id'][];
	align?: 'left' | 'center' | 'right';
	bgColor?: string;
	fgColor?: string;
	font?: 'serif' | 'sans-serif' | 'monospace';
	borderWidth?: number;
	borderColor?: string;
	borderStyle?: 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
	borderRadius?: number;
	padding?: number;
	rounded?: boolean;
	hidden?: boolean;
	className?: string;
	img?: string;
	height? : string;
	customCss?:string;
};

export type AsUiText = AsUiComponentBase & {
	type: 'text';
	text?: string;
	size?: number;
	bold?: boolean;
	color?: string;
	font?: 'serif' | 'sans-serif' | 'monospace';
	className?: string;
	img?: string;
	height?: string;
	customCss?:string;
};

export type AsUiMfm = AsUiComponentBase & {
	type: 'mfm';
	text?: string;
	size?: number;
	bold?: boolean;
	color?: string;
	font?: 'serif' | 'sans-serif' | 'monospace';
	className?: string;
	onClickEv?: (evId: string) => void;
	customCss?:string;
};

export type AsUiButton = AsUiComponentBase & {
	type: 'button';
	text?: string;
	onClick?: () => void;
	onTouchDown?: () => void;
	onTouchMove?: () => void;
	onTouchUp?: () => void;
	primary?: boolean;
	rounded?: boolean;
	disabled?: boolean;
	className?: string;
	customCss?:string;
};

export type AsUiButtons = AsUiComponentBase & {
	type: 'buttons';
	buttons?: AsUiButton[];
	className?: string;
	customCss?:string;
};

export type AsUiSwitch = AsUiComponentBase & {
	type: 'switch';
	onChange?: (v: boolean) => void;
	default?: boolean;
	label?: string;
	caption?: string;
	className?: string;
	customCss?:string;
};

export type AsUiTextarea = AsUiComponentBase & {
	type: 'textarea';
	onInput?: (v: string) => void;
	default?: string;
	label?: string;
	caption?: string;
	className?: string;
	customCss?:string;
};

export type AsUiTextInput = AsUiComponentBase & {
	type: 'textInput';
	onInput?: (v: string) => void;
	default?: string;
	label?: string;
	caption?: string;
	className?: string;
	customCss?:string;
};

export type AsUiNumberInput = AsUiComponentBase & {
	type: 'numberInput';
	onInput?: (v: number) => void;
	default?: number;
	label?: string;
	caption?: string;
	className?: string;
	customCss?:string;
};

export type AsUiSelect = AsUiComponentBase & {
	type: 'select';
	items?: {
		text: string;
		value: string;
	}[];
	onChange?: (v: string) => void;
	default?: string;
	label?: string;
	caption?: string;
	className?: string;
	customCss?:string;
};

export type AsUiFolder = AsUiComponentBase & {
	type: 'folder';
	children?: AsUiComponent['id'][];
	title?: string;
	opened?: boolean;
	className?: string;
	customCss?:string;
};

type PostFormPropsForAsUi = {
	text: string;
	cw?: string;
	visibility?: (typeof Misskey.noteVisibilities)[number];
	localOnly?: boolean;
};

export type AsUiPostFormButton = AsUiComponentBase & {
	type: 'postFormButton';
	text?: string;
	primary?: boolean;
	rounded?: boolean;
	form?: PostFormPropsForAsUi;
	className?: string;
	customCss?:string;
};

export type AsUiCustomChart = AsUiComponentBase & {
	type: 'customChart';
	chartId: string;
	title?: string;
	keys: string[];
	values: number[];
	label?: string;
	className?: string;
	customCss?:string;
};

export type AsUiHTML = AsUiComponentBase & {
	type: 'HTML';
	HTML?: string;
	className?: string;
	customCss?:string;
};

export type AsUiPostForm = AsUiComponentBase & {
	type: 'postForm';
	form?: PostFormPropsForAsUi;
	customCss?:string;
};

export type AsUiComponent = AsUiRoot | AsUiContainer | AsUiText | AsUiMfm | AsUiButton | AsUiButtons | AsUiSwitch | AsUiTextarea | AsUiTextInput | AsUiNumberInput | AsUiSelect | AsUiFolder | AsUiPostFormButton | AsUiPostForm | AsUiCustomChart | AsUiHTML ;
export function patch(id: string, def: values.Value, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>) {
	// TODO
}

function getRootOptions(def: values.Value | undefined): Omit<AsUiRoot, 'id' | 'type'> {
	utils.assertObject(def);

	const children = def.value.get('children');
	utils.assertArray(children);

	return {
		children: children.value.map(v => {
			utils.assertObject(v);
			return v.value.get('id').value;
		}),
	};
}

function getContainerOptions(def: values.Value | undefined): Omit<AsUiContainer, 'id' | 'type'> {
	utils.assertObject(def);

	const children = def.value.get('children');
	if (children) utils.assertArray(children);
	const align = def.value.get('align');
	if (align) utils.assertString(align);
	const bgColor = def.value.get('bgColor');
	if (bgColor) utils.assertString(bgColor);
	const fgColor = def.value.get('fgColor');
	if (fgColor) utils.assertString(fgColor);
	const font = def.value.get('font');
	if (font) utils.assertString(font);
	const borderWidth = def.value.get('borderWidth');
	if (borderWidth) utils.assertNumber(borderWidth);
	const borderColor = def.value.get('borderColor');
	if (borderColor) utils.assertString(borderColor);
	const borderStyle = def.value.get('borderStyle');
	if (borderStyle) utils.assertString(borderStyle);
	const borderRadius = def.value.get('borderRadius');
	if (borderRadius) utils.assertNumber(borderRadius);
	const padding = def.value.get('padding');
	if (padding) utils.assertNumber(padding);
	const rounded = def.value.get('rounded');
	if (rounded) utils.assertBoolean(rounded);
	const hidden = def.value.get('hidden');
	if (hidden) utils.assertBoolean(hidden);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const img = def.value.get('img');
	if (img) utils.assertString(img);
	const height = def.value.get('height');
	if (height) utils.assertString(height);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		children: children ? children.value.map(v => {
			utils.assertObject(v);
			return v.value.get('id').value;
		}) : [],
		align: align?.value,
		fgColor: fgColor?.value,
		bgColor: bgColor?.value,
		font: font?.value,
		borderWidth: borderWidth?.value,
		borderColor: borderColor?.value,
		borderStyle: borderStyle?.value,
		borderRadius: borderRadius?.value,
		padding: padding?.value,
		rounded: rounded?.value,
		hidden: hidden?.value,
		className: className?.value ?? 'MkContainer',
		img: img?.value ?? 'none',
		height: height?.value ?? 'auto',
		customCss: customCss?.value ?? '',
	};
}

function getTextOptions(def: values.Value | undefined): Omit<AsUiText, 'id' | 'type'> {
	utils.assertObject(def);

	const text = def.value.get('text');
	if (text) utils.assertString(text);
	const size = def.value.get('size');
	if (size) utils.assertNumber(size);
	const bold = def.value.get('bold');
	if (bold) utils.assertBoolean(bold);
	const color = def.value.get('color');
	if (color) utils.assertString(color);
	const font = def.value.get('font');
	if (font) utils.assertString(font);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const img = def.value.get('img');
	if (img) utils.assertString(img);
	const height = def.value.get('height');
	if (height) utils.assertString(height);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		text: text?.value,
		size: size?.value,
		bold: bold?.value,
		color: color?.value,
		font: font?.value,
		className: className?.value ?? 'MkText',
		img: img?.value ?? 'none',
		height: height?.value ?? 'auto',
		customCss: customCss?.value ?? '',
	};
}

function getMfmOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiMfm, 'id' | 'type'> {
	utils.assertObject(def);

	const text = def.value.get('text');
	if (text) utils.assertString(text);
	const size = def.value.get('size');
	if (size) utils.assertNumber(size);
	const bold = def.value.get('bold');
	if (bold) utils.assertBoolean(bold);
	const color = def.value.get('color');
	if (color) utils.assertString(color);
	const font = def.value.get('font');
	if (font) utils.assertString(font);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const onClickEv = def.value.get('onClickEv');
	if (onClickEv) utils.assertFunction(onClickEv);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		text: text?.value,
		size: size?.value,
		bold: bold?.value,
		color: color?.value,
		font: font?.value,
		className: className?.value ?? 'MkMfm',
		onClickEv: (evId: string) => {
			if (onClickEv) call(onClickEv, [values.STR(evId)]);
		},
		customCss: customCss?.value ?? '',
	};
}

function getTextInputOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiTextInput, 'id' | 'type'> {
	utils.assertObject(def);

	const onInput = def.value.get('onInput');
	if (onInput) utils.assertFunction(onInput);
	const defaultValue = def.value.get('default');
	if (defaultValue) utils.assertString(defaultValue);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const caption = def.value.get('caption');
	if (caption) utils.assertString(caption);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		onInput: (v) => {
			if (onInput) call(onInput, [utils.jsToVal(v)]);
		},
		default: defaultValue?.value,
		label: label?.value,
		caption: caption?.value,
		className: className?.value ?? 'MkTextInput',
		customCss: customCss?.value ?? '',
	};
}

function getTextareaOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiTextarea, 'id' | 'type'> {
	utils.assertObject(def);

	const onInput = def.value.get('onInput');
	if (onInput) utils.assertFunction(onInput);
	const defaultValue = def.value.get('default');
	if (defaultValue) utils.assertString(defaultValue);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const caption = def.value.get('caption');
	if (caption) utils.assertString(caption);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		onInput: (v) => {
			if (onInput) call(onInput, [utils.jsToVal(v)]);
		},
		default: defaultValue?.value,
		label: label?.value,
		caption: caption?.value,
		className: className?.value ?? 'MkTextArea',
		customCss: customCss?.value ?? '',
	};
}

function getNumberInputOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiNumberInput, 'id' | 'type'> {
	utils.assertObject(def);

	const onInput = def.value.get('onInput');
	if (onInput) utils.assertFunction(onInput);
	const defaultValue = def.value.get('default');
	if (defaultValue) utils.assertNumber(defaultValue);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const caption = def.value.get('caption');
	if (caption) utils.assertString(caption);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		onInput: (v) => {
			if (onInput) call(onInput, [utils.jsToVal(v)]);
		},
		default: defaultValue?.value,
		label: label?.value,
		caption: caption?.value,
		className: className?.value ?? 'MkNumberInput',
		customCss: customCss?.value ?? '',
	};
}

function getButtonOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiButton, 'id' | 'type'> {
	utils.assertObject(def);

	const text = def.value.get('text');
	if (text) utils.assertString(text);
	const onClick = def.value.get('onClick');
	if (onClick) utils.assertFunction(onClick);
	const onTouchDown = def.value.get('onTouchDown');
	if (onTouchDown) utils.assertFunction(onTouchDown);
	const onTouchMove = def.value.get('onTouchMove');
	if (onTouchMove) utils.assertFunction(onTouchMove);
	const onTouchUp = def.value.get('onTouchUp');
	if (onTouchUp) utils.assertFunction(onTouchUp);
	const primary = def.value.get('primary');
	if (primary) utils.assertBoolean(primary);
	const rounded = def.value.get('rounded');
	if (rounded) utils.assertBoolean(rounded);
	const disabled = def.value.get('disabled');
	if (disabled) utils.assertBoolean(disabled);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		text: text?.value,
		onClick: () => {
			if (onClick) call(onClick, []);
		},
		onTouchDown: () => {
			if (onTouchDown) call(onTouchDown, []);
		},
		onTouchMove: () => {
			if (onTouchMove) call(onTouchMove, []);
		},
		onTouchUp: () => {
			if (onTouchUp) call(onTouchUp, []);
		},
		primary: primary?.value,
		rounded: rounded?.value,
		disabled: disabled?.value,
		className: className?.value ?? 'MkButton',
		customCss: customCss?.value ?? '',
	};
}

function getButtonsOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiButtons, 'id' | 'type'> {
	utils.assertObject(def);

	const buttons = def.value.get('buttons');
	if (buttons) utils.assertArray(buttons);
	const className = def.value.get('className');
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);
	if (className) utils.assertString(className);

	return {
		buttons: buttons ? buttons.value.map(button => {
			utils.assertObject(button);
			const text = button.value.get('text');
			utils.assertString(text);
			const onClick = button.value.get('onClick');
			if(onClick) utils.assertFunction(onClick);
			const onTouchDown = button.value.get('onTouchDown');
			if(onTouchDown) utils.assertFunction(onTouchDown);
			const onTouchMove = button.value.get('onTouchMove');
			if(onTouchMove) utils.assertFunction(onTouchMove);
			const onTouchUp = button.value.get('onTouchUp');
			if(onTouchUp) utils.assertFunction(onTouchUp);
			const primary = button.value.get('primary');
			if (primary) utils.assertBoolean(primary);
			const rounded = button.value.get('rounded');
			if (rounded) utils.assertBoolean(rounded);
			const disabled = button.value.get('disabled');
			if (disabled) utils.assertBoolean(disabled);
			const className = button.value.get('className');
			if (className) utils.assertString(className);
			const customCss = button.value.get('customCss');
			if (customCss) utils.assertString(customCss);

			return {
				text: text.value,
				onClick: () => {
					if (onClick) call(onClick, []);
				},
				onTouchDown: () => {
					if (onTouchDown) call(onTouchDown, []);
				},
				onTouchMove: () => {
					if (onTouchMove) call(onTouchMove, []);
				},
				onTouchUp: () => {
					if (onTouchUp) call(onTouchUp, []);
				},
				primary: primary?.value,
				rounded: rounded?.value,
				disabled: disabled?.value,
				className: className?.value ?? 'MkButton',
				customCss: customCss?.value ?? '',
			};
		}) : [],
		className: className?.value ?? 'MkButtons',
		customCss: customCss?.value ?? '',
	};
}

function getSwitchOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiSwitch, 'id' | 'type'> {
	utils.assertObject(def);

	const onChange = def.value.get('onChange');
	if (onChange) utils.assertFunction(onChange);
	const defaultValue = def.value.get('default');
	if (defaultValue) utils.assertBoolean(defaultValue);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const caption = def.value.get('caption');
	if (caption) utils.assertString(caption);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		onChange: (v) => {
			if (onChange) call(onChange, [utils.jsToVal(v)]);
		},
		default: defaultValue?.value,
		label: label?.value,
		caption: caption?.value,
		className: className?.value ?? 'MkSwitch',
		customCss: customCss?.value ?? '',
	};
}

function getSelectOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiSelect, 'id' | 'type'> {
	utils.assertObject(def);

	const items = def.value.get('items');
	if (items) utils.assertArray(items);
	const onChange = def.value.get('onChange');
	if (onChange) utils.assertFunction(onChange);
	const defaultValue = def.value.get('default');
	if (defaultValue) utils.assertString(defaultValue);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const caption = def.value.get('caption');
	if (caption) utils.assertString(caption);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		items: items ? items.value.map(item => {
			utils.assertObject(item);
			const text = item.value.get('text');
			utils.assertString(text);
			const value = item.value.get('value');
			if (value) utils.assertString(value);
			return {
				text: text.value,
				value: value ? value.value : text.value,
			};
		}) : [],
		onChange: (v) => {
			if (onChange) call(onChange, [utils.jsToVal(v)]);
		},
		default: defaultValue?.value,
		label: label?.value,
		caption: caption?.value,
		className: className?.value ?? 'MkSelect',
		customCss: customCss?.value ?? '',
	};
}

function getFolderOptions(def: values.Value | undefined): Omit<AsUiFolder, 'id' | 'type'> {
	utils.assertObject(def);

	const children = def.value.get('children');
	if (children) utils.assertArray(children);
	const title = def.value.get('title');
	if (title) utils.assertString(title);
	const opened = def.value.get('opened');
	if (opened) utils.assertBoolean(opened);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		children: children ? children.value.map(v => {
			utils.assertObject(v);
			return v.value.get('id').value;
		}) : [],
		title: title?.value ?? '',
		opened: opened?.value ?? true,
		className: className?.value ?? 'MkFolder',
		customCss: customCss?.value ?? '',
	};
}

function getCustomChartOptions(def: values.Value | undefined): Omit<AsUiCustomChart, 'id' | 'type'> {
	utils.assertObject(def);

	const chartId = def.value.get('chartId');
	if (chartId) utils.assertString(chartId);
	const title = def.value.get('title');
	if (title) utils.assertString(title);
	const keys = def.value.get('keys');
	if (keys) utils.assertArray(keys);
	const values = def.value.get('values');
	if (values) utils.assertArray(values);
	const label = def.value.get('label');
	if (label) utils.assertString(label);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		chartId: chartId.value,
		title: title?.value ?? '',
		keys: keys ? keys.value.map(v => {
			utils.assertString(v);
			return v.value;
		}) : [],
		values: values ? values.value.map(v => {
			utils.assertNumber(v);
			return v.value;
		}) : [],
		label: label?.value ?? '',
		className: className?.value ?? 'MkCustomChart',
		customCss: customCss?.value ?? '',
	};
}

function getPostFormProps(form: values.VObj): PostFormPropsForAsUi {
	const text = form.value.get('text');
	utils.assertString(text);
	const cw = form.value.get('cw');
	if (cw) utils.assertString(cw);
	const visibility = form.value.get('visibility');
	if (visibility) utils.assertString(visibility);
	const localOnly = form.value.get('localOnly');
	if (localOnly) utils.assertBoolean(localOnly);

	return {
		text: text.value,
		cw: cw?.value,
		visibility: (visibility?.value && (Misskey.noteVisibilities as readonly string[]).includes(visibility.value)) ? visibility.value as typeof Misskey.noteVisibilities[number] : undefined,
		localOnly: localOnly?.value,
	};
}

function getPostFormButtonOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiPostFormButton, 'id' | 'type'> {
	utils.assertObject(def);

	const text = def.value.get('text');
	if (text) utils.assertString(text);
	const primary = def.value.get('primary');
	if (primary) utils.assertBoolean(primary);
	const rounded = def.value.get('rounded');
	if (rounded) utils.assertBoolean(rounded);
	const form = def.value.get('form');
	if (form) utils.assertObject(form);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		text: text?.value,
		primary: primary?.value,
		rounded: rounded?.value,
		form: form ? getPostFormProps(form) : {
			text: '',
		},
		className: className?.value ?? 'MkPostFormButton',
		customCss: customCss?.value ?? '',
	};
}

function getPostFormOptions(def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>): Omit<AsUiPostForm, 'id' | 'type'> {
	utils.assertObject(def);

	const form = def.value.get('form');
	if (form) utils.assertObject(form);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		form: form ? getPostFormProps(form) : {
			text: '',
		},
		customCss: customCss?.value ?? '',
	};
}

function getHTMLOptions(def: values.Value | undefined): Omit<AsUiHTML, 'id' | 'type'> {
	utils.assertObject(def);

	const HTML = def.value.get('HTML');
	if (HTML) utils.assertString(HTML);
	const className = def.value.get('className');
	if (className) utils.assertString(className);
	const customCss = def.value.get('customCss');
	if (customCss) utils.assertString(customCss);

	return {
		HTML: HTML?.value,
		className: className?.value ?? 'MkHTML',
		customCss: customCss?.value ?? '',
	};
}

export function registerAsUiLib(components: Ref<AsUiComponent>[], done: (root: Ref<AsUiRoot>) => void) {
	const instances = {};

	function createComponentInstance(type: AsUiComponent['type'], def: values.Value | undefined, id: values.Value | undefined, getOptions: (def: values.Value | undefined, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>) => any, call: (fn: values.VFn, args: values.Value[]) => Promise<values.Value>) {
		if (id) utils.assertString(id);
		const _id = id?.value ?? uuid();
		const component = ref({
			...getOptions(def, call),
			type,
			id: _id,
		});
		components.push(component);
		const instance = values.OBJ(new Map([
			['id', values.STR(_id)],
			['update', values.FN_NATIVE(([def], opts) => {
				utils.assertObject(def);
				const updates = getOptions(def, call);
				for (const update of def.value.keys()) {
					if (!Object.hasOwn(updates, update)) continue;
					component.value[update] = updates[update];
				}
			})],
		]));
		instances[_id] = instance;
		return instance;
	}

	const rootInstance = createComponentInstance('root', utils.jsToVal({ children: [] }), utils.jsToVal('___root___'), getRootOptions, () => {});
	const rootComponent = components[0] as Ref<AsUiRoot>;
	done(rootComponent);

	return {
		'Ui:root': rootInstance,

		'Ui:patch': values.FN_NATIVE(([id, val], opts) => {
			utils.assertString(id);
			utils.assertArray(val);
			patch(id.value, val.value, opts.call);
		}),

		'Ui:get': values.FN_NATIVE(([id], opts) => {
			utils.assertString(id);
			const instance = instances[id.value];
			if (instance) {
				return instance;
			} else {
				return values.NULL;
			}
		}),

		// Ui:root.update({ children: [...] }) の糖衣構文
		'Ui:render': values.FN_NATIVE(([children], opts) => {
			utils.assertArray(children);

			rootComponent.value.children = children.value.map(v => {
				utils.assertObject(v);
				return v.value.get('id').value;
			});
		}),

		'Ui:C:container': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('container', def, id, getContainerOptions, opts.topCall);
		}),

		'Ui:C:text': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('text', def, id, getTextOptions, opts.topCall);
		}),

		'Ui:C:mfm': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('mfm', def, id, getMfmOptions, opts.topCall);
		}),

		'Ui:C:textarea': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('textarea', def, id, getTextareaOptions, opts.topCall);
		}),

		'Ui:C:textInput': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('textInput', def, id, getTextInputOptions, opts.topCall);
		}),

		'Ui:C:numberInput': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('numberInput', def, id, getNumberInputOptions, opts.topCall);
		}),

		'Ui:C:button': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('button', def, id, getButtonOptions, opts.topCall);
		}),

		'Ui:C:buttons': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('buttons', def, id, getButtonsOptions, opts.topCall);
		}),

		'Ui:C:switch': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('switch', def, id, getSwitchOptions, opts.topCall);
		}),

		'Ui:C:select': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('select', def, id, getSelectOptions, opts.topCall);
		}),

		'Ui:C:folder': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('folder', def, id, getFolderOptions, opts.topCall);
		}),

		'Ui:C:postFormButton': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('postFormButton', def, id, getPostFormButtonOptions, opts.topCall);
		}),

		'Ui:C:postForm': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('postForm', def, id, getPostFormOptions, opts.topCall);
		}),

		'Ui:C:customChart': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('customChart', def, id, getCustomChartOptions, opts.call);
		}),

		'Ui:C:HTML': values.FN_NATIVE(([def, id], opts) => {
			return createComponentInstance('HTML', def, id, getHTMLOptions, opts.call);
		}),

	};
}
