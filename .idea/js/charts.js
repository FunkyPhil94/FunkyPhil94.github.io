let chartsLoaded = false;
let dataTable = null;
let chart = null;


export function initChartsOnce({ SHEET_KEY, GID }){
    if (chartsLoaded) return;
    chartsLoaded = true;


// Google Charts laden
    window.google.charts.load('current', { packages: ['corechart'] });
    window.google.charts.setOnLoadCallback(() => {
        runQuery({ SHEET_KEY, GID });
    });


    document.getElementById('runQuery').addEventListener('click', () => runQuery({ SHEET_KEY, GID }));
    document.getElementById('redraw').addEventListener('click', drawChart);
    document.getElementById('chartType').addEventListener('change', drawChart);
    document.getElementById('h').addEventListener('change', () => {
        document.getElementById('chart').style.height = document.getElementById('h').value + 'px';
        drawChart();
    });
}


function runQuery({ SHEET_KEY, GID }){
    const q = document.getElementById('query').value.trim() || 'select *';
    const tqx = 'responseHandler:handleQuery';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_KEY}/gviz/tq?gid=${GID}&tq=${encodeURIComponent(q)}&tqx=${encodeURIComponent(tqx)}`;


// JSONP Callback
    window.handleQuery = function(resp){
        if (resp.isError && resp.isError()){
            alert('Fehler in der GViz‑Abfrage: ' + resp.getMessage());
            return;
        }
        dataTable = resp.getDataTable();
        drawChart();
    };


// Script‑Tag einfügen (JSONP)
    const s = document.createElement('script');
    s.src = url + '&_=' + Date.now();
    document.body.appendChild(s);
}


function drawChart() {
    if (!dataTable) return;
    const type = document.getElementById('chartType').value;
    const container = document.getElementById('chart');
    const options = {
        legend: {position: 'top'},
        backgroundColor: 'transparent',
        hAxis: {textStyle: {color: '#dbe5ff'}},
        vAxis: {textStyle: {color: '#dbe5ff'}, gridlines: {color: '#22306b'}},
        titleTextStyle: {color: '#e9eefc'},
        chartArea: {left: 60, right: 20, top: 40, bottom: 60}
    };


    if (type === 'bar') {
        chart = chart || new window.google.visualization.ColumnChart(container);
    }
}