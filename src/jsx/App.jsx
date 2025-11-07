import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';
// Use chroma to make the color scale.
// https://gka.github.io/chroma.js/

const getHashValue = (key) => {
  const matches = window.location.hash.match(new RegExp(`${key}=([^&]*)`));
  return matches ? matches[1] : null;
};

const hemisphere = getHashValue('hemisphere') ? getHashValue('hemisphere').replace('%20', ' ') : 'World';
const month = getHashValue('month') ? getHashValue('month') : 'Year';
const speed = getHashValue('speed') ? getHashValue('speed') : 200;

const hemispheres = {
  World: 0,
  'Northern hemisphere': 1,
  'Southern hemisphere': 2
};
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

let start_year = 1880;
let end_year = 2024;

function App() {
  const scaleMax = 1.3;
  const scaleMin = -1.3;
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

  const tooltip = d3.select('.tooltip')
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
    // Define tooltip div (once)

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
        const i = Array.from(event.currentTarget.parentNode.children).indexOf(event.currentTarget);
        const xValue = x.current.domain()[i]; // your x label
        tooltip
          .style('opacity', 1)
          .html(`${xValue + start_year}: <b>${d.toFixed(2)}°C</b>`)
          .style('left', `${event.pageX - 70}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  }, [curYear, data, f, tooltip]);

  const startInterval = useCallback(() => {
    interval.current = setInterval(() => {
      setCurYear(currentState => {
        setCurrentTemp(data[currentState - start_year + 1]);
        const newState = currentState + 1;
        if (newState >= end_year) {
          clearInterval(interval.current);
        }
        return newState;
      });
    }, parseInt(speed, 10));

    // Clearing the interval
    return () => {
      interval.current = null;
      clearInterval(interval.current);
    };
  }, [data]);

  const getData = useCallback(() => {
    const file_path = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2025-cop30/' : (window.location.href.includes('localhost:80')) ? './' : 'https://unctad-infovis.github.io/2025-cop30/'}`;
    Promise.all([
      d3.text(`${file_path}assets/data/GLB.Ts+dSST.csv`),
      d3.text(`${file_path}assets/data/NH.Ts+dSST.csv`),
      d3.text(`${file_path}assets/data/SH.Ts+dSST.csv`)
    ]).then((files) => {
      files = files.map(file => d3.csvParse(file.split('\n').slice(1).join('\n')));
      setData(files[hemispheres[hemisphere]].map((file, i) => {
        if (i === 0 && file[months[month]] === '***') {
          start_year = 1880;
        } else if (i === (files[hemispheres[hemisphere]].length - 1) && file[months[month]] === '***') {
          end_year = 2024;
        }
        return +file[months[month]];
      }));
    }).catch((err) => {
      console.log(err);
    });
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
              <h3>Temperatures on the rise</h3>
              <h4>
                Combined mean land-surface air and sea-surface water temperature anomalies (land-ocean temperature index, L-OTI),
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
      <div className="chart_container" ref={chartRef} />
      <div className="info_container">
        <div className="hemispehere">{hemisphere}</div>
        <div className="year_container">{curYear}</div>
        <div className="temp_container" style={{ color: f_text(currentTemp) }}>
          {((currentTemp > 0) ? '+' : '') + currentTemp}
          °C
        </div>
      </div>
      <div className="caption_container">
        <em>Source:</em>
        {' '}
        UN Trade and Development (UNCTAD), based
        {' '}
        <a href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noreferrer">NASA</a>
        <br />
        <em>Note:</em>
        {' '}
        Reference period: 1951–1980
      </div>
      <div className="tooltip" />
    </div>
  );
}
export default App;
