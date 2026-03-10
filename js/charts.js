/**
 * charts.js — Funciones de renderizado de gráficas con Plotly.js
 */

const PLOTLY_CONFIG = { responsive: true, displayModeBar: false };

const COLORS = {
  teal: '#00bcd4',
  tealDark: '#0097a7',
  navy: '#1a237e',
  white: '#ffffff',
  textMuted: '#90a4ae',
  textLight: '#e0e7ee',
  cardBg: 'rgba(255,255,255,0.03)',
  gridColor: 'rgba(255,255,255,0.06)',
  palette: ['#00bcd4', '#26c6da', '#4dd0e1', '#80deea', '#b2ebf2',
            '#0097a7', '#00838f', '#006064', '#e0f7fa', '#84ffff'],
  diverging: ['#00bcd4', '#4dd0e1', '#80deea', '#e0f7fa', '#fff9c4',
              '#fff176', '#ffee58', '#fdd835', '#fbc02d', '#f9a825'],
};

const LAYOUT_BASE = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { family: 'Open Sans, sans-serif', color: COLORS.textMuted, size: 12 },
  margin: { l: 60, r: 30, t: 40, b: 60 },
  xaxis: { gridcolor: COLORS.gridColor, zerolinecolor: COLORS.gridColor },
  yaxis: { gridcolor: COLORS.gridColor, zerolinecolor: COLORS.gridColor },
};

function formatCOP(value) {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

function shortCOP(value) {
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(0) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(0) + 'M';
  return formatCOP(value);
}

// ===== 1. Mapa Choropleth =====
function renderMapa(data) {
  const paises = data.salario_por_pais.filter(p => p.iso_alpha);
  const trace = {
    type: 'choropleth',
    locations: paises.map(p => p.iso_alpha),
    z: paises.map(p => p.mediana),
    text: paises.map(p => `${p.pais}<br>Mediana: ${formatCOP(p.mediana)}<br>Promedio: ${formatCOP(p.promedio)}<br>n=${p.count}`),
    hoverinfo: 'text',
    colorscale: [
      [0, '#e0f7fa'],
      [0.25, '#80deea'],
      [0.5, '#26c6da'],
      [0.75, '#00838f'],
      [1, '#004d40']
    ],
    colorbar: {
      title: { text: 'Mediana COP', font: { color: COLORS.textMuted, size: 11 } },
      tickfont: { color: COLORS.textMuted, size: 10 },
      tickformat: ',.0f',
      len: 0.6,
    },
    marker: { line: { color: COLORS.gridColor, width: 0.5 } },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { l: 0, r: 0, t: 10, b: 0 },
    geo: {
      showframe: false,
      showcoastlines: true,
      coastlinecolor: 'rgba(255,255,255,0.15)',
      showland: true,
      landcolor: 'rgba(255,255,255,0.03)',
      showocean: true,
      oceancolor: 'rgba(13,27,42,0.8)',
      showlakes: false,
      projection: { type: 'natural earth' },
      bgcolor: 'rgba(0,0,0,0)',
    },
  };

  Plotly.newPlot('chart-mapa', [trace], layout, PLOTLY_CONFIG);
}

// ===== 2. Continentes =====
function renderContinentes(data) {
  const d = data.salario_por_continente;
  const trace = {
    type: 'bar',
    x: d.map(c => c.continente),
    y: d.map(c => c.promedio),
    text: d.map(c => `${formatCOP(c.promedio)}<br>n=${c.count.toLocaleString('es-CO')}`),
    hoverinfo: 'text',
    marker: {
      color: d.map((_, i) => COLORS.palette[i % COLORS.palette.length]),
      line: { width: 0 },
    },
    textposition: 'outside',
    texttemplate: '%{y:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { ...LAYOUT_BASE.margin, b: 80 },
    yaxis: {
      ...LAYOUT_BASE.yaxis,
      title: { text: 'Salario Promedio (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    xaxis: { ...LAYOUT_BASE.xaxis, tickangle: 0 },
  };

  Plotly.newPlot('chart-continentes', [trace], layout, PLOTLY_CONFIG);
}

// ===== 3. Educación =====
function renderEducacion(data) {
  const d = data.salario_por_nivel_educativo;
  const trace = {
    type: 'bar',
    y: d.map(e => e.nivel),
    x: d.map(e => e.promedio),
    text: d.map(e => `${formatCOP(e.promedio)} (n=${e.count.toLocaleString('es-CO')})`),
    hoverinfo: 'text',
    orientation: 'h',
    marker: {
      color: d.map((_, i) => COLORS.palette[i % COLORS.palette.length]),
    },
    textposition: 'outside',
    texttemplate: '%{x:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { l: 200, r: 80, t: 20, b: 40 },
    xaxis: {
      ...LAYOUT_BASE.xaxis,
      title: { text: 'Salario Promedio (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    yaxis: { ...LAYOUT_BASE.yaxis, autorange: 'reversed' },
  };

  Plotly.newPlot('chart-educacion', [trace], layout, PLOTLY_CONFIG);
}

// ===== 4a. Jerarquía - Donut =====
function renderJerarquiaDonut(data) {
  const d = data.distribucion_nivel_jerarquico;
  const trace = {
    type: 'pie',
    labels: d.map(l => l.nivel),
    values: d.map(l => l.count),
    hole: 0.55,
    textinfo: 'label+percent',
    textposition: 'outside',
    textfont: { color: COLORS.textMuted, size: 11 },
    marker: {
      colors: ['#00bcd4', '#26c6da', '#4dd0e1', '#80deea', '#0097a7', '#00838f', '#006064'],
      line: { color: 'rgba(13,27,42,1)', width: 2 },
    },
    hovertemplate: '%{label}<br>%{value:,} registros<br>%{percent}<extra></extra>',
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { l: 20, r: 20, t: 20, b: 20 },
    showlegend: false,
  };

  Plotly.newPlot('chart-jerarquia-donut', [trace], layout, PLOTLY_CONFIG);
}

// ===== 4b. Jerarquía - Barras =====
function renderJerarquiaBarras(data) {
  const d = data.salario_por_nivel_jerarquico;
  const trace = {
    type: 'bar',
    x: d.map(l => l.nivel),
    y: d.map(l => l.promedio),
    text: d.map(l => `${formatCOP(l.promedio)}<br>n=${l.count.toLocaleString('es-CO')}`),
    hoverinfo: 'text',
    marker: {
      color: d.map((_, i) => COLORS.palette[i % COLORS.palette.length]),
    },
    textposition: 'outside',
    texttemplate: '%{y:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { ...LAYOUT_BASE.margin, b: 100 },
    yaxis: {
      ...LAYOUT_BASE.yaxis,
      title: { text: 'Salario Promedio (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    xaxis: { ...LAYOUT_BASE.xaxis, tickangle: -30 },
  };

  Plotly.newPlot('chart-jerarquia-barras', [trace], layout, PLOTLY_CONFIG);
}

// ===== 5. Industrias =====
function renderIndustrias(data) {
  const d = data.salario_por_industria;
  const trace = {
    type: 'bar',
    y: d.map(i => i.industria),
    x: d.map(i => i.promedio),
    text: d.map(i => `${formatCOP(i.promedio)} (n=${i.count.toLocaleString('es-CO')})`),
    hoverinfo: 'text',
    orientation: 'h',
    marker: {
      color: d.map((_, idx) => {
        const t = idx / (d.length - 1);
        return `rgba(0, ${Math.round(188 - t * 100)}, ${Math.round(212 - t * 80)}, ${1 - t * 0.3})`;
      }),
    },
    textposition: 'outside',
    texttemplate: '%{x:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { l: 200, r: 100, t: 10, b: 40 },
    xaxis: {
      ...LAYOUT_BASE.xaxis,
      title: { text: 'Salario Promedio (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    yaxis: { ...LAYOUT_BASE.yaxis, autorange: 'reversed' },
  };

  Plotly.newPlot('chart-industrias', [trace], layout, PLOTLY_CONFIG);
}

// ===== 6. Experiencia =====
function renderExperiencia(data) {
  const d = data.salario_por_experiencia;
  const trace = {
    type: 'bar',
    x: d.map(e => e.rango),
    y: d.map(e => e.promedio),
    text: d.map(e => `${formatCOP(e.promedio)}<br>n=${e.count.toLocaleString('es-CO')}`),
    hoverinfo: 'text',
    marker: {
      color: d.map((_, i) => {
        const t = i / (d.length - 1);
        return `rgba(0, ${Math.round(188 + t * 40)}, ${Math.round(212 - t * 50)}, 1)`;
      }),
    },
    textposition: 'outside',
    texttemplate: '%{y:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    margin: { ...LAYOUT_BASE.margin, b: 100 },
    yaxis: {
      ...LAYOUT_BASE.yaxis,
      title: { text: 'Salario Promedio (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    xaxis: { ...LAYOUT_BASE.xaxis, tickangle: -30 },
  };

  Plotly.newPlot('chart-experiencia', [trace], layout, PLOTLY_CONFIG);
}

// ===== 7. Género =====
function renderGenero(data) {
  const d = data.salario_por_genero;

  const tracePromedio = {
    type: 'bar',
    name: 'Promedio',
    x: d.map(g => g.genero),
    y: d.map(g => g.promedio),
    text: d.map(g => `Promedio: ${formatCOP(g.promedio)}<br>n=${g.count.toLocaleString('es-CO')}`),
    hoverinfo: 'text',
    marker: { color: COLORS.teal },
    textposition: 'outside',
    texttemplate: '%{y:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const traceMediana = {
    type: 'bar',
    name: 'Mediana',
    x: d.map(g => g.genero),
    y: d.map(g => g.mediana),
    text: d.map(g => `Mediana: ${formatCOP(g.mediana)}<br>n=${g.count.toLocaleString('es-CO')}`),
    hoverinfo: 'text',
    marker: { color: COLORS.tealDark },
    textposition: 'outside',
    texttemplate: '%{y:,.0f}',
    textfont: { color: COLORS.textMuted, size: 10 },
  };

  const layout = {
    ...LAYOUT_BASE,
    barmode: 'group',
    margin: { ...LAYOUT_BASE.margin, b: 80 },
    yaxis: {
      ...LAYOUT_BASE.yaxis,
      title: { text: 'Salario (COP)', font: { size: 11 } },
      tickformat: ',.0f',
    },
    legend: {
      font: { color: COLORS.textMuted },
      bgcolor: 'rgba(0,0,0,0)',
      x: 1, xanchor: 'right', y: 1,
    },
  };

  Plotly.newPlot('chart-genero', [tracePromedio, traceMediana], layout, PLOTLY_CONFIG);
}
