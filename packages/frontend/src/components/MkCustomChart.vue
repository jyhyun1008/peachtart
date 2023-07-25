<template>
<div>
	<canvas :id="chartId"></canvas>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, watch, PropType } from 'vue';
import { Chart, registerables } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';

Chart.register(...registerables);
	
const props = defineProps({
	chartId: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: false,
		default: 'My Chart',
	},
	keys: {
		type: String[],
		required: true,
	},
	values: {
		type: number[],
		required: true,
	},
	label: {
		type: String,
		required: false,
	}
}); 

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

Chart.defaults.borderColor = '#36A2EB';
Chart.defaults.color = '#000';

</script>

<style lang="scss" module>
</style>
