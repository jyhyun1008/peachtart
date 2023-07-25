<template>
<div>
	<canvas :id="chartId" :class="[{ title: 'title' }, { keys: 'keys' }, { values: 'values' }, { label: 'label' }]"></canvas>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, watch, PropType } from 'vue';
import { Chart, registerables } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';

Chart.register(...registerables);

const props = defineProps<{
	chartId: string;
	title: string;
	keys: string[];
	values: number[];
	label: string;
}>(); 

onMounted(() => {
	const ctx = document.getElementById(props.chartId);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.keys,
      datasets: [{
        label: props.label,
        data: props.values,
        borderColor: Utils.CHART_COLORS.red,
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
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
