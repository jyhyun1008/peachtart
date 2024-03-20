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
	<div v-else-if="c.type === 'HTML'" :class="[ c.className ]" v-html="'<style>'+c.css+'</style>'+c.HTML"></div>
	<div v-else-if="c.type === 'text' && c.img !== 'none'" :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ height: '300px', backgroundImage: 'url('+c.img+')', backgroundSize: 'cover', fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }">{{ c.text }}</span>
	<span v-else-if="c.type === 'text'" :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }">{{ c.text }}</span>
	<Mfm v-else-if="c.type === 'mfm'" :class="[{ [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }, c.className]" :style="{ fontSize: c.size ? `${c.size * 100}%` : null, fontWeight: c.bold ? 'bold' : null, color: c.color ?? null }" :text="c.text"/>
	<MkButton v-else-if="c.type === 'button'" :primary="c.primary" :className="c.className" :rounded="c.rounded" :disabled="c.disabled" :small="size === 'small'" inline @click="c.onClick">{{ c.text }}</MkButton>
	<div v-else-if="c.type === 'buttons'" :class="['_buttons', c.className ]" :style="{ justifyContent: align }">
		<MkButton v-for="button in c.buttons" :primary="button.primary" :className="button.className" :rounded="button.rounded" :disabled="button.disabled" inline :small="size === 'small'" @click="button.onClick">{{ button.text }}</MkButton>
	</div>
	<MkSwitch v-else-if="c.type === 'switch'" :modelValue="valueForSwitch" :className="c.className" @update:modelValue="onSwitchUpdate">
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkSwitch>
	<MkTextarea v-else-if="c.type === 'textarea'" :modelValue="c.default ?? null" :className="c.className" @update:modelValue="c.onInput">
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkTextarea>
	<MkInput v-else-if="c.type === 'textInput'" :small="size === 'small'" :modelValue="c.default ?? null" :className="c.className" @update:modelValue="c.onInput">
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkInput>
	<MkInput v-else-if="c.type === 'numberInput'" :small="size === 'small'" :modelValue="c.default ?? null" type="number" :className="c.className" @update:modelValue="c.onInput">
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
	</MkInput>
	<MkSelect v-else-if="c.type === 'select'" :small="size === 'small'" :className="c.className" :modelValue="c.default ?? null" @update:modelValue="c.onChange">
		<template v-if="c.label" #label>{{ c.label }}</template>
		<template v-if="c.caption" #caption>{{ c.caption }}</template>
		<option v-for="item in c.items" :key="item.value" :value="item.value">{{ item.text }}</option>
	</MkSelect>
	<MkButton v-else-if="c.type === 'postFormButton'" :primary="c.primary" :rounded="c.rounded" :small="size === 'small'" inline @click="openPostForm">{{ c.text }}</MkButton>
	<div v-else-if="c.type === 'postForm'" :class="$style.postForm">
		<MkPostForm
			fixed
			:instant="true"
			:initialText="c.form?.text"
			:initialCw="c.form?.cw"
		/>
	</div>
	<MkFolder v-else-if="c.type === 'folder'" :defaultOpen="c.opened">
		<template #label>{{ c.title }}</template>
		<div :class="c.className">
			<template v-for="child in c.children" :key="child">
				<MkAsUi v-if="!g(child).hidden" :component="g(child)" :components="props.components" :size="size"/>
			</template>
	  </div>
	</MkFolder>
	<MkCustomChart v-else-if="c.type === 'customChart'" :chartId="c.chartId" :title="c.title" :keys="c.keys" :values="c.values" :label="c.label" :className="c.className" />
	<div v-else-if="c.type === 'container'" :class="[$style.container, { [$style.fontSerif]: c.font === 'serif', [$style.fontMonospace]: c.font === 'monospace' }]" :style="{ textAlign: c.align ?? null, backgroundColor: c.bgColor ?? null, color: c.fgColor ?? null, borderWidth: c.borderWidth ? `${c.borderWidth}px` : 0, borderColor: c.borderColor ?? 'var(--divider)', padding: c.padding ? `${c.padding}px` : 0, borderRadius: c.rounded ? '8px' : 0 }">
		<div :class="['_container', c.className]">
			<template v-for="child in c.children" :key="child">
				<MkAsUi v-if="!g(child).hidden" :component="g(child)" :components="props.components" :size="size" :align="c.align"/>
			</template>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { Ref, ref } from 'vue';
import * as os from '@/os.js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkSelect from '@/components/MkSelect.vue';
import { AsUiComponent, AsUiRoot, AsUiPostFormButton } from '@/scripts/aiscript/ui.js';
import MkFolder from '@/components/MkFolder.vue';
import MkPostForm from '@/components/MkPostForm.vue';

const props = withDefaults(defineProps<{
	component: AsUiComponent;
	components: Ref<AsUiComponent>[];
	size: 'small' | 'medium' | 'large';
	align: 'left' | 'center' | 'right';
}>(), {
	size: 'medium',
	align: 'left',
});

const c = props.component;

if (c.HTML) {

}

function g(id) {
	const v = props.components.find(x => x.value.id === id)?.value;
	if (v) return v;

	return {
		id: 'dummy',
		type: 'root',
		children: [],
	} as AsUiRoot;
}

const valueForSwitch = ref('default' in c && typeof c.default === 'boolean' ? c.default : false);

function onSwitchUpdate(v) {
	valueForSwitch.value = v;
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
	background: var(--bg);
	border-radius: 8px;
}
</style>
