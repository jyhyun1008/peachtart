<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div v-if="c.type === 'root'" :class="$style.root">
		<template v-for="child in c.children" :key="child">
			<MkAsUi v-if="!g(child).hidden" :component="g(child)" :components="props.components" :size="size"/>
		</template>
	</div>
	<div v-else-if="c.type === 'HTML'" :class="[ c.className ]" v-html="c.HTML" v-bind:style="c.customCss" ></div>
	<div v-else-if="c.type === 'text'  && c.img !== 'none'" :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ height: c.height, backgroundImage: 'url('+c.img+')', backgroundSize: 'cover', fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }" v-bind:style="c.customCss" >{{ c.text }}</div>
	<span v-else-if="c.type === 'text'"  :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }" v-bind:style="c.customCss" >{{ c.text }}</span>
	<Mfm v-else-if="c.type === 'mfm'"  :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }" :text="c.text" v-bind:style="c.customCss" />
	<MkButton v-else-if="c.type === 'button'"  :primary="c.primary" :className="c.className" :style="{ cursor: pointer }" :rounded="c.rounded" :disabled="c.disabled" :small="size === 'small'" inline @click="c.onClick" @touchstart="c.onTouchDown" @touchend="c.onTouchUp" @touchmove="c.onTouchMove" v-bind:style="c.customCss" >{{ c.text }}</MkButton>
	<div v-else-if="c.type === 'buttons'"  :class="['_buttons', c.className ]" :style="{ justifyContent: align }" v-bind:style="c.customCss" >
		<MkButton v-for="button in c.buttons" :primary="button.primary" :style="{ cursor: pointer }" :className="button.className" :rounded="button.rounded" :disabled="button.disabled" inline :small="size === 'small'" @click="button.onClick" @touchstart="button.onTouchDown" @touchend="button.onTouchUp" @touchmove="button.onTouchMove" v-bind:style="button.customCss" >{{ button.text }}</MkButton>
	</div>
	<MkSwitch v-else-if="c.type === 'switch'"  :modelValue="valueForSwitch" :className="c.className" @update:modelValue="onSwitchUpdate" v-bind:style="c.customCss" >
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkSwitch>
	<MkTextarea v-else-if="c.type === 'textarea'"  :modelValue="c.default ?? null" :className="c.className" @update:modelValue="c.onInput" v-bind:style="c.customCss" >
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkTextarea>
	<MkInput v-else-if="c.type === 'textInput'"  :small="size === 'small'" :modelValue="c.default ?? null" :className="c.className" @update:modelValue="c.onInput" v-bind:style="c.customCss" >
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkInput>
	<MkInput v-else-if="c.type === 'numberInput'"  :small="size === 'small'" :modelValue="c.default ?? null" type="number" :className="c.className" @update:modelValue="c.onInput" v-bind:style="c.customCss" >
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkInput>
	<MkSelect v-else-if="c.type === 'select'"  :small="size === 'small'" :className="c.className" :modelValue="valueForSelect" @update:modelValue="onSelectUpdate" v-bind:style="c.customCss" >
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
		<option v-for="item in c.items" :key="item.value" :value="item.value">{{ item.text }}</option>
	</MkSelect>
	<MkButton v-else-if="c.type === 'postFormButton'"  :primary="c.primary" :rounded="c.rounded" :small="size === 'small'" inline @click="openPostForm" v-bind:style="c.customCss" >{{ c.text }}</MkButton>
	<div v-else-if="c.type === 'postForm'"  :class="$style.postForm">
		<MkPostForm
			fixed
			:instant="true"
			:initialText="c.form?.text"
			:initialCw="c.form?.cw"
			:initialVisibility="c.form?.visibility"
			:initialLocalOnly="c.form?.localOnly"
		/>
	</div>
	<MkFolder v-else-if="c.type === 'folder'" :defaultOpen="c.opened">
		<template #label>{{ c.title }}</template>
		<div  :class="c.className">
			<template v-for="child in c.children" :key="child">
				<MkAsUi v-if="!g(child).hidden" :component="g(child)" :components="props.components" :size="size"/>
			</template>
	  </div>
	</MkFolder>
<MkCustomChart v-else-if="c.type === 'customChart'"  :chartId="c.chartId" :title="c.title" :keys="c.keys" :values="c.values" :label="c.label" :className="c.className" />
<div v-else-if="c.type === 'container'" :class="[$style.container, { [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }]" :style="containerStyle">
	<div :class="['_container', c.className]" :style="{ backgroundImage: 'url('+c.img+')', height: 'inherit', backgroundSize: 'cover' }" v-bind:style="c.customCss" ></div>
		<template v-for="child in c.children" :key="child">
			<MkAsUi v-if="!g(child).hidden" :component="g(child)" :components="props.components" :size="size" :align="c.align"/>
		</template>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import * as os from '@/os.js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkSelect from '@/components/MkSelect.vue';
import type { AsUiComponent, AsUiRoot, AsUiPostFormButton } from '@/aiscript/ui.js';
import MkFolder from '@/components/MkFolder.vue';
import MkPostForm from '@/components/MkPostForm.vue';

const props = withDefaults(defineProps<{
	component: AsUiComponent;
	components: Ref<AsUiComponent>[];
	size?: 'small' | 'medium' | 'large';
	align?: 'left' | 'center' | 'right';
}>(), {
	size: 'medium',
	align: 'left',
});

const c = props.component;

function g(id: string) {
	const v = props.components.find(x => x.value.id === id)?.value;
	if (v) return v;

	return {
		id: 'dummy',
		type: 'root',
		children: [],
	} as AsUiRoot;
}

const containerStyle = computed(() => {
	if (c.type !== 'container') return undefined;

	// width, color, styleのうち一つでも指定があれば、枠線がちゃんと表示されるようにwidthとstyleのデフォルト値を設定
	// radiusは単に角を丸める用途もあるため除外
	const isBordered = c.borderWidth ?? c.borderColor ?? c.borderStyle;

	const border = isBordered ? {
		borderWidth: c.borderWidth ?? '1px',
		borderColor: c.borderColor ?? 'var(--MI_THEME-divider)',
		borderStyle: c.borderStyle ?? 'solid',
	} : undefined;

	return {
		textAlign: c.align,
		backgroundColor: c.bgColor,
		color: c.fgColor,
		padding: c.padding ? `${c.padding}px` : 0,
		borderRadius: (c.borderRadius ?? (c.rounded ? 8 : 0)) + 'px',
		...border,
	};
});

const valueForSwitch = ref('default' in c && typeof c.default === 'boolean' ? c.default : false);

function onSwitchUpdate(v: boolean) {
	valueForSwitch.value = v;
	if ('onChange' in c && c.onChange) {
		c.onChange(v as never);
	}
}

const valueForSelect = ref('default' in c && typeof c.default !== 'boolean' ? c.default ?? null : null);

function onSelectUpdate(v) {
	valueForSelect.value = v;
	if ('onChange' in c && c.onChange) {
		c.onChange(v as never);
	}
}

function openPostForm() {
	const form = (c as AsUiPostFormButton).form;
	if (!form) return;

	os.post({
		initialText: form.text,
		initialCw: form.cw,
		initialVisibility: form.visibility,
		initialLocalOnly: form.localOnly,
		instant: true,
	});
}
</script>

<style lang="scss" module>

@import url('https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.530/neodgm_code/style.css');
@font-face {
	font-family: 'HBIOS-SYS';
	src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2207-01@1.0/HBIOS-SYS.woff2') format('woff2');
	font-weight: normal;
	font-style: normal;
}
.root {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.container {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.fontSerif {
	font-family: 'HBIOS-SYS', serif;
}

.fontMonospace {
	font-family: 'NeoDunggeunmo Code', Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
}

.postForm {
	background: var(--MI_THEME-bg);
	border-radius: 8px;
}
</style>
