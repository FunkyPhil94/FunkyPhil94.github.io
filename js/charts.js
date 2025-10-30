import { filtered } from './data.js';
import { groupCount, groupSum } from './utils.js';

let chartTeam, chartPos, chartSubset, chartAmountTeam;

function makeOrUpdateChart(existing, canvasId, labels, data, title){
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (existing) existing.destroy();
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: title, data }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
  });
}

export function renderCharts(){
  const teamPairs = groupCount(filtered, 'Team');
  const posPairs = groupCount(filtered, 'Position');
  const subsetPairs = groupCount(filtered, 'Subset');
  const amountTeam = groupSum(filtered, 'Team');

  chartTeam       = makeOrUpdateChart(chartTeam,       'chartTeam',       teamPairs.map(x=>x[0]), teamPairs.map(x=>x[1]), 'Cards pro Team');
  chartPos        = makeOrUpdateChart(chartPos,        'chartPos',        posPairs.map(x=>x[0]), posPairs.map(x=>x[1]), 'Cards pro Position');
  chartSubset     = makeOrUpdateChart(chartSubset,     'chartSubset',     subsetPairs.map(x=>x[0]), subsetPairs.map(x=>x[1]), 'Cards pro Subset');
  chartAmountTeam = makeOrUpdateChart(chartAmountTeam, 'chartAmountTeam', amountTeam.map(x=>x[0]), amountTeam.map(x=>x[1]), 'Summe Amount pro Team');
}
