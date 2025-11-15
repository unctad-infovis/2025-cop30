import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

import chroma from 'chroma-js';
import roundNr from './helpers/RoundNr.js';

// https://vis4.net/chromajs/
// Use chroma to make the color scale.
// https://gka.github.io/chroma.js/

const getHashValue = (key) => {
  const matches = window.location.hash.match(new RegExp(`${key}=([^&]*)`));
  return matches ? matches[1] : null;
};

const hemisphere = getHashValue('hemisphere') ? getHashValue('hemisphere').replace('%20', ' ') : 'World';
const month = getHashValue('month') ? getHashValue('month') : 'Year';
const speed = getHashValue('speed') ? getHashValue('speed') : 100;

// eslint-disable-next-line
const hemispheres = {
  World: 0,
  'Northern hemisphere': 1,
  'Southern hemisphere': 2
};
// eslint-disable-next-line
const months = {
  January: 'Jan',
  February: 'Feb',
  March: 'Mar',
  April: 'Apr',
  May: 'May',
  June: 'Jun',
  July: 'Jul',
  August: 'Aug',
  September: 'Sep',
  October: 'Oct',
  November: 'Nov',
  December: 'Dec',
  Year: 'J-D'
};

const start_year = 1850;
const end_year = 2024;

function App() {
  const scaleMax = 1.5;
  const scaleMin = -1.5;
  const f = chroma.scale('RdYlBu').domain([scaleMax, 0, scaleMin]);
  const f_text = chroma.scale(['red', 'rgba(0, 0, 0, 0.3)', 'blue']).padding(-1).domain([scaleMax, 0, scaleMin]);
  const margin = useMemo(() => ({
    top: 40, right: 0, bottom: 40, left: 60
  }), []);

  const chart_elements = useRef(null);
  const yAxis = useRef(null);
  const xAxis = useRef(null);
  const appRef = useRef(null);
  const chartRef = useRef(null);
  const interval = useRef(null);
  const svg = useRef(null);
  const x = useRef(null);
  const y = useRef(null);
  const width = useRef(null);
  const height = useRef(null);
  const isVisible = useIsVisible(chartRef, { once: true });

  const [currentTemp, setCurrentTemp] = useState(0);
  const [curYear, setCurYear] = useState(start_year);
  const [data, setData] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const tooltip = d3.select(appRef.current)
    .select('.tooltip')
    .style('position', 'absolute')
    .style('padding', '4px 8px')
    .style('background', 'white')
    .style('border', '1px solid #ccc')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  const updateData = useCallback(() => { // https://www.d3-graph-gallery.com/graph/barplot_button_data_hard.html
    const bar_data = data.slice(0, curYear - start_year + 1);
    x.current = d3.scaleBand()
      .range([0, width.current]);
    y.current = d3.scaleLinear()
      .range([0, height.current]);

    x.current.domain(bar_data.map((el, i) => i));
    xAxis.current.call(d3.axisBottom(x.current));

    y.current.domain([Math.max(0.15, d3.max(bar_data, d => d)), Math.min(-0.3, d3.min(bar_data, d => d))]);
    yAxis.current.call(d3.axisLeft(y.current)
      .tickValues([-0.5, 0, 0.5, 1, 1.5])
      .tickFormat(i => `${i}°C`)
      .tickSizeInner(-width.current)
      .tickSizeOuter(0));

    // Then recolor grid lines
    yAxis.current.selectAll('.tick line')
      .attr('stroke', d => (d === 0 ? 'rgba(0, 0, 0, 1)' : '#ccc')) // 0-line black, others gray
      .attr('stroke-width', d => (d === 0 ? 0.5 : 0.5)); // optional: make 0-line thicker

    yAxis.current.selectAll('.tick text')
      .attr('fill', d => (d === 0 ? '#000' : '#666'))
      .attr('font-weight', d => (d === 0 ? '700' : '400'));

    const bars = chart_elements.current.selectAll('.bar')
      .data(bar_data);

    bars.exit().remove();

    bars.enter().append('rect')
      .attr('class', 'bar')
      .attr('fill', d => f(d))
      .attr('height', 0)
      .attr('width', 0)
      .attr('x', 0)
      .attr('y', y.current(0))
      .merge(bars)
      .attr('width', x.current.bandwidth())
      .attr('height', d => Math.abs(y.current(d) - y.current(0)))
      .attr('y', d => ((d > 0) ? y.current(Math.max(0, d)) : y.current(Math.max(0, d)) + 1))
      .attr('x', (d, i) => x.current(i))
      .on('mousemove', (event, d) => {
        // Get container bounding box
        const containerRect = appRef.current.getBoundingClientRect();

        // Mouse position relative to container
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        const i = Array.from(event.currentTarget.parentNode.children).indexOf(event.currentTarget);
        const xValue = x.current.domain()[i]; // your x label

        tooltip
          .style('opacity', 1)
          .html(`${xValue + start_year}: <b>${d.toFixed(2)}°C</b>`)
          .style('left', `${mouseX + 30}px`) // offset slightly so tooltip is not on top of cursor
          .style('top', `${mouseY + 30}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }, [curYear, data, f, tooltip]);

  const startInterval = useCallback(() => {
    setTimeout(() => {
      interval.current = setInterval(() => {
        setCurYear(currentState => {
          const newState = currentState + 1;

          if (newState > end_year) {
            clearInterval(interval.current);
            setIsFinished(true); // 👉 Animation ended
            return currentState;
          }
          setCurrentTemp(data[currentState - start_year + 1]);
          return newState;
        });
      }, parseInt(speed, 10));
    }, 1000);

    return () => {
      interval.current = null;
      clearInterval(interval.current);
    };
  }, [data]);

  const restartAnimation = () => {
    setCurYear(start_year);
    setCurrentTemp(data[0]);
    setIsFinished(false);

    clearInterval(interval.current);
    startInterval();
  };

  const getData = useCallback(() => {
    setData([-0.0697, 0.06733333333, 0.0897, 0.05613333333, 0.06026666667, 0.0549, -0.01933333333, -0.1294666667, -0.03116666667, 0.08633333333, -0.06113333333, -0.1185333333, -0.2126666667, -0.02223333333, -0.07253333333, 0.04203333333, 0.04743333333, 0.02706666667, 0.0338, 0.06846666667, 0.0089, -0.01306666667, -0.0003333333333, 0.005566666667, -0.0318, -0.04223333333, -0.06796666667, 0.2863666667, 0.3473666667, 0.0477, 0.0305, 0.122625, 0.0694, 0.019375, -0.114, -0.1089, -0.0987, -0.1519, 0.0363, 0.130325, -0.140125, -0.022975, -0.0864, -0.104675, -0.097375, -0.0244, 0.09565, 0.1105, -0.078875, 0.044475, 0.14975, 0.086425, -0.049775, -0.155225, -0.227325, -0.0395, 0.0375, -0.138925, -0.176375, -0.2143, -0.17835, -0.1915, -0.1199, -0.104025, 0.085625, 0.133025, -0.091325, -0.216475, -0.074375, -0.010325, 0.01095, 0.0766, -0.011025, 0.004175, 0.006875, 0.04335, 0.179725, 0.0727, 0.0873, -0.0848, 0.1295, 0.194, 0.137675, -0.0153, 0.133175, 0.079875, 0.12945, 0.26135, 0.274725, 0.260025, 0.34182, 0.3624, 0.28776, 0.30208, 0.44512, 0.33164, 0.20018, 0.2143333333, 0.1823666667, 0.18195, 0.1005333333, 0.2424833333, 0.2921166667, 0.3643666667, 0.15805, 0.1253, 0.069, 0.3044333333, 0.3390833333, 0.3016166667, 0.2483333333, 0.3172333333, 0.2847666667, 0.3111833333, 0.07321666667, 0.1624333333, 0.21605, 0.2448166667, 0.18915, 0.32415, 0.2798833333, 0.1647, 0.27715, 0.4113833333, 0.1674, 0.2199666667, 0.1356333333, 0.4225, 0.3316666667, 0.4346333333, 0.5456833333, 0.5906833333, 0.3963, 0.5804333333, 0.4025333333, 0.37905, 0.4548166667, 0.5958166667, 0.6374, 0.5242333333, 0.7158666667, 0.6785666667, 0.4731666667, 0.5113666667, 0.5717666667, 0.72695, 0.6119166667, 0.7437666667, 0.9049166667, 0.6599333333, 0.6635166667, 0.8086, 0.8873666667, 0.8808, 0.8048666667, 0.9575666667, 0.9104166667, 0.9148166667, 0.79295, 0.91985, 0.9997833333, 0.87695, 0.9140666667, 0.9472166667, 1.004583333, 1.15465, 1.294066667, 1.196083333, 1.118283333, 1.2478, 1.276416667, 1.114533333, 1.1564, 1.452833333, 1.552316667]);
    // const file_path = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2025-cop30/' : (window.location.href.includes('localhost:80')) ? './' : 'https://unctad-infovis.github.io/2025-cop30/'}`;
    // Promise.all([
    //   d3.text(`${file_path}assets/data/GLB.Ts+dSST.csv`),
    //   d3.text(`${file_path}assets/data/NH.Ts+dSST.csv`),
    //   d3.text(`${file_path}assets/data/SH.Ts+dSST.csv`)
    // ]).then((files) => {
    //   files = files.map(file => d3.csvParse(file.split('\n').slice(1).join('\n')));
    //   setData(files[hemispheres[hemisphere]].map((file, i) => {
    //     if (i === 0 && file[months[month]] === '***') {
    //       start_year = 1880;
    //     } else if (i === (files[hemispheres[hemisphere]].length - 1) && file[months[month]] === '***') {
    //       end_year = 2024;
    //     }
    //     return +file[months[month]];
    //   }));
    // }).catch((err) => {
    //   console.log(err);
    // });
  }, []);

  useEffect(() => {
    if (interval.current === null && (data !== null)) {
      startInterval();
    }
  }, [data, startInterval]);

  useEffect(() => {
    if (data !== null) {
      updateData();
    }
  }, [data, curYear, updateData]);

  const createChart = useCallback(() => {
    width.current = chartRef.current.offsetWidth - margin.left - margin.right;
    height.current = chartRef.current.offsetHeight - margin.top - margin.bottom;
    svg.current = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width.current + margin.left + margin.right)
      .attr('height', height.current + margin.top + margin.bottom);
    yAxis.current = svg.current.append('g')
      .attr('class', 'yaxis')
      .attr('transform', `translate(${margin.left - 1}, ${margin.top})`);
    xAxis.current = svg.current.append('g')
      .attr('class', 'xaxis')
      .attr('transform', `translate(${margin.left},${height.current - 50})`);
    chart_elements.current = svg.current.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    getData();
  }, [getData, margin]);

  useEffect(() => {
    if (isVisible === true) {
      setTimeout(() => {
        createChart();
      }, 300);
    }
  }, [createChart, isVisible]);

  return (
    <div className="app" ref={appRef}>
      <div className="title_container">
        <div className="text_container">
          <div className="main_title_container">
            <img src="https://static.dwcdn.net/custom/themes/unctad-2024-rebrand/Blue%20arrow.svg" className="logo" alt="UN Trade and Development logo" />
            <div className="title">
              <h3>Global heating pushes temperatures into danger zone</h3>
              <h4>
                Annual global mean temperature anomalies relative to a pre-industrial (1850–1900) baseline, celcius,
                {(month !== 'Year') ? ` in ${month}` : ''}
                {' '}
                {start_year}
                –
                {end_year}
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="chart_wrapper">
        {isFinished && (
        <button className="restart_button" onClick={restartAnimation} type="button">
          Restart animation
        </button>
        )}
        <div className="chart_container" ref={chartRef} />
        <div className="info_container">
          <div className="hemispehere">{hemisphere}</div>
          <div className="year_container">{curYear}</div>
          <div className="temp_container" style={{ color: f_text(currentTemp) }}>
            {((currentTemp > 0) ? '+' : '') + roundNr(currentTemp, 2)}
            °C
          </div>
        </div>
      </div>
      <div className="caption_container">
        <em>Source:</em>
        {' '}
        UN Trade and Development (UNCTAD), based on data from
        {' '}
        <a href="https://wmo.int/publication-series/state-of-global-climate-2024" target="_blank" rel="noreferrer">World Meteorological Organization (WMO)</a>
        . The annual average is calculated as the average from available data for each year.
        <br />
        <em>Note:</em>
        {' '}
        The WMO temperature assessment draws on six datasets: the European Center for Medium Range Weather Forecasts (ECMWF), Japan Meteorological Agency, NASA, the US National Oceanic and Atmospheric Administration (NOAA), the UK’s Met Office in collaboration with the Climatic Research Unit at the University of East Anglia (HadCRUT), and Berkeley Earth.
      </div>
      <div className="tooltip" />
    </div>
  );
}
export default App;
