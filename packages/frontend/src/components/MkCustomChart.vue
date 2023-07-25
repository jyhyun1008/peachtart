<template>
<div>
	<canvas :id="chartId"></canvas>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, watch, PropType } from 'vue';
import { Chart } from 'chart.js';
import gradient from 'chartjs-plugin-gradient';

const props = defineProps<{
	chartId: string;
}>(); 

const ctx = document.getElementById(props.chartId);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

</script>

<style lang="scss" module>
</style>
