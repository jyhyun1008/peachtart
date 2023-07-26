<template>
<div ref="rootEl">
	<canvas :id="chartId" :class="[{ title: 'title' }, { keys: 'keys' }, { values: 'values' }, { label: 'label' }, { className: 'className' }]"></canvas>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { Chart, registerables } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';

Chart.register(...registerables);

const props = withDefaults(defineProps<{
	chartId: string;
	title: string;
	keys: string[];
	values: number[];
	label: string;
	className: string;
}>(), {
	chartId: 'test',
	title: '',
	keys: [],
	values: [],
	label: '',
	className: 'MkCustomChart',
});

onMounted(() => {
	const ctx = document.getElementById(props.chartId);

	document.querySelector('.className').classList.add(props.className);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.keys,
      datasets: [{
        label: props.label,
        data: props.values,
        borderColor: '#FF9899',
        backgroundColor: '#FF989988',
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
      }]
    },
    options: {
			responsive: true,
			plugins: {
	      title: {
	        display: true,
	        text: props.title
	      }
			},
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});

</script>

<style lang="scss" module>
</style>
