<template>
<div :class="{ [$style.center]: page.alignCenter, [$style.serif]: page.font === 'serif' }">
	<XBlock v-for="child in page.content" :key="child.id" :page="page" :block="child" :h="2"/>
</div>
</template>

<script lang="ts" setup>
import { onMounted, nextTick } from 'vue';
import * as Misskey from 'misskey-js';
import XBlock from './page.block.vue';

defineProps<{
	page: Misskey.entities.Page,
}>();
</script>

<style lang="scss" module>

@font-face {
	font-family: 'HBIOS-SYS';
	src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2207-01@1.0/HBIOS-SYS.woff2') format('woff2');
	font-weight: normal;
	font-style: normal;
}

.serif {
	font-family: 'HBIOS-SYS', serif;
}

.center {
	text-align: center;
}
</style>
