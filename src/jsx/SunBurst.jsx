import React, {
  useEffect, useRef, useState, useCallback
} from 'react';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import { useIsVisible } from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';
import '../styles/styles.less';

const avg_temps = [-0.16, -0.29, -0.38, -0.48, -0.27, -0.23, -0.4, -0.44, -0.49, -0.44, -0.45, -0.38, -0.36, -0.16, -0.15, -0.37, -0.47, -0.31, -0.29, -0.28, -0.2, -0.29, -0.27, -0.28, -0.23, -0.11, -0.22, -0.21, -0.37, -0.16, -0.1, -0.16, -0.29, -0.13, -0.2, -0.15, -0.03, -0.01, -0.02, 0.12, 0.18, 0.06, 0.08, 0.2, 0.09, -0.08, -0.03, -0.11, -0.11, -0.18, -0.07, 0.01, 0.08, -0.13, -0.14, -0.19, 0.05, 0.06, 0.03, -0.03, 0.06, 0.03, 0.05, -0.2, -0.11, -0.06, -0.02, -0.08, 0.05, 0.03, -0.08, 0.01, 0.16, -0.07, -0.01, -0.1, 0.18, 0.07, 0.16, 0.26, 0.32, 0.14, 0.31, 0.16, 0.12, 0.18, 0.32, 0.39, 0.27, 0.45, 0.41, 0.22, 0.23, 0.31, 0.44, 0.33, 0.46, 0.61, 0.38, 0.39, 0.53, 0.63, 0.61, 0.53, 0.68, 0.64, 0.66, 0.54, 0.65, 0.72, 0.61, 0.64, 0.68, 0.75, 0.9, 1.01, 0.92, 0.85, 0.98, 1.01, 0.85, 0.89, 1.17, 1.28];
const countries = {
  ABW: 'Aruba', AFG: 'Afghanistan', AGO: 'Angola', AIA: 'Anguilla', ALA: 'Åland Islands', ALB: 'Albania', AND: 'Andorra', ARE: 'United Arab Emirates (the)', ARG: 'Argentina', ARM: 'Armenia', ASM: 'American Samoa', ATF: 'French Southern Territories (the)', ATG: 'Antigua and Barbuda', AUS: 'Australia', AUT: 'Austria', AZE: 'Azerbaijan', BDI: 'Burundi', BEL: 'Belgium', BEN: 'Benin', BES: 'Bonaire, Sint Eustatius and Saba', BFA: 'Burkina Faso', BGD: 'Bangladesh', BGR: 'Bulgaria', BHR: 'Bahrain', BHS: 'Bahamas (the)', BIH: 'Bosnia and Herzegovina', BLR: 'Belarus', BLZ: 'Belize', BMU: 'Bermuda', BOL: 'Bolivia (Plurinational State of)', BRA: 'Brazil', BRB: 'Barbados', BRN: 'Brunei Darussalam', BTN: 'Bhutan', BWA: 'Botswana', CAF: 'Central African Republic (the)', CAN: 'Canada', CCK: 'Cocos (Keeling) Islands (the)', CHE: 'Switzerland', CHL: 'Chile', CHN: 'China', CIV: "Côte d'Ivoire", CMR: 'Cameroon', COD: 'Congo (the Democratic Republic of the)', COG: 'Congo (the)', COK: 'Cook Islands (the)', COL: 'Colombia', COM: 'Comoros (the)', CPV: 'Cabo Verde', CRI: 'Costa Rica', CUB: 'Cuba', CUW: 'Curaçao', CXR: 'Christmas Island', CYM: 'Cayman Islands (the)', CYP: 'Cyprus', CZE: 'Czechia', DEU: 'Germany', DJI: 'Djibouti', DMA: 'Dominica', DNK: 'Denmark', DOM: 'Dominican Republic (the)', DZA: 'Algeria', ECU: 'Ecuador', EGY: 'Egypt', ERI: 'Eritrea', ESP: 'Spain', EST: 'Estonia', ETH: 'Ethiopia', FIN: 'Finland', FJI: 'Fiji', FRA: 'France', FRO: 'Faroe Islands (the)', FSM: 'Micronesia (Federated States of)', GAB: 'Gabon', GBR: 'United Kingdom of Great Britain and Northern Ireland (the)', GEO: 'Georgia', GGY: 'Guernsey', GHA: 'Ghana', GIB: 'Gibraltar', GIN: 'Guinea', GLP: 'Guadeloupe', GMB: 'Gambia (the)', GNB: 'Guinea-Bissau', GNQ: 'Equatorial Guinea', GRC: 'Greece', GRD: 'Grenada', GRL: 'Greenland', GTM: 'Guatemala', GUF: 'French Guiana', GUM: 'Guam', GUY: 'Guyana', HKG: 'Hong Kong SAR, China', HMD: 'Heard Island and McDonald Islands', HND: 'Honduras', HRV: 'Croatia', HTI: 'Haiti', HUN: 'Hungary', IDN: 'Indonesia', IMN: 'Isle of Man', IND: 'India', IOT: 'British Indian Ocean Territory (the)', IRL: 'Ireland', IRN: 'Iran (Islamic Republic of)', IRQ: 'Iraq', ISL: 'Iceland', ISR: 'Israel', ITA: 'Italy', JAM: 'Jamaica', JEY: 'Jersey', JOR: 'Jordan', JPN: 'Japan', KAZ: 'Kazakhstan', KEN: 'Kenya', KGZ: 'Kyrgyzstan', KHM: 'Cambodia', KIR: 'Kiribati', KNA: 'Saint Kitts and Nevis', KOR: 'Korea (the Republic of)', KSV: 'Kosovo', KWT: 'Kuwait', LAO: "Lao People's Democratic Republic (the)", LBN: 'Lebanon', LBR: 'Liberia', LBY: 'Libya', LCA: 'Saint Lucia', LIE: 'Liechtenstein', LKA: 'Sri Lanka', LSO: 'Lesotho', LTU: 'Lithuania', LUX: 'Luxembourg', LVA: 'Latvia', MAC: 'Macao SAR, China', MAF: 'Saint Martin (French part)', MAR: 'Morocco', MCO: 'Monaco', MDA: 'Moldova (the Republic of)', MDG: 'Madagascar', MDV: 'Maldives', MEX: 'Mexico', MHL: 'Marshall Islands (the)', MKD: 'Republic of North Macedonia', MLI: 'Mali', MLT: 'Malta', MMR: 'Myanmar', MNE: 'Montenegro', MNG: 'Mongolia', MNP: 'Northern Mariana Islands (the)', MOZ: 'Mozambique', MRT: 'Mauritania', MSR: 'Montserrat', MTQ: 'Martinique', MUS: 'Mauritius', MWI: 'Malawi', MYS: 'Malaysia', MYT: 'Mayotte', NAM: 'Namibia', NCL: 'New Caledonia', NER: 'Niger (the)', NFK: 'Norfolk Island', NGA: 'Nigeria', NIC: 'Nicaragua', NIU: 'Niue', NLD: 'Netherlands (the Kingdom of the)', NOR: 'Norway', NPL: 'Nepal', NRU: 'Nauru', NZL: 'New Zealand', OMN: 'Oman', PAK: 'Pakistan', PAN: 'Panama', PCN: 'Pitcairn', PER: 'Peru', PHL: 'Philippines (the)', PLW: 'Palau', PNG: 'Papua New Guinea', POL: 'Poland', PRI: 'Puerto Rico', PRK: "Korea (the Democratic People's Republic of)", PRT: 'Portugal', PRY: 'Paraguay', PSE: 'Palestine, State of', PYF: 'French Polynesia', QAT: 'Qatar', REU: 'Réunion', ROU: 'Romania', RUS: 'Russian Federation (the)', RWA: 'Rwanda', SAU: 'Saudi Arabia', SDN: 'Sudan (the)', SEN: 'Senegal', SGP: 'Singapore', SHN: 'Saint Helena, Ascension and Tristan da Cunha', SJM: 'Svalbard and Jan Mayen', SLB: 'Solomon Islands', SLE: 'Sierra Leone', SLV: 'El Salvador', SMR: 'San Marino', SOM: 'Somalia', SPM: 'Saint Pierre and Miquelon', SRB: 'Serbia', SSD: 'South Sudan', STP: 'Sao Tome and Principe', SUR: 'Suriname', SVK: 'Slovakia', SVN: 'Slovenia', SWE: 'Sweden', SWZ: 'Eswatini', SXM: 'Sint Maarten (Dutch part)', SYC: 'Seychelles', SYR: 'Syrian Arab Republic', TCA: 'Turks and Caicos Islands (the)', TCD: 'Chad', TGO: 'Togo', THA: 'Thailand', TJK: 'Tajikistan', TKL: 'Tokelau', TKM: 'Turkmenistan', TLS: 'Timor-Leste', TON: 'Tonga', TTO: 'Trinidad and Tobago', TUN: 'Tunisia', TUR: 'Türkiye', TUV: 'Tuvalu', TWN: 'Taiwan (Province of China)', TZA: 'Tanzania, United Republic of', UGA: 'Uganda', UKR: 'Ukraine', UMI: 'United States Minor Outlying Islands (the)', URY: 'Uruguay', USA: 'United States of America (the)', UZB: 'Uzbekistan', VAT: 'Holy See (the)', VCT: 'Saint Vincent and the Grenadines', VEN: 'Venezuela (Bolivarian Republic of)', VGB: 'Virgin Islands (British)', VIR: 'Virgin Islands (U.S.)', VNM: 'Viet Nam', VUT: 'Vanuatu', WLF: 'Wallis and Futuna', WSM: 'Samoa', YEM: 'Yemen', ZAF: 'South Africa', ZMB: 'Zambia', ZWE: 'Zimbabwe'
};
const legend_ring_points = [-2, -1, 0, 1, 2, 3];
const my_domain = [-3.5, 3.5];
const startYear = 1901;
const lastYear = 2024;
const x = d3.scaleBand().range([(Math.PI / 2) + 0.07, (Math.PI / 2) + (2 * Math.PI) - 0.1]).align(0);
const inner_radius = 0;
const outer_radius = 400;
const y = d3.scaleLinear().range([inner_radius, outer_radius]).domain(my_domain);

function App() {
  const appRef = useRef(null);
  const chartRef = useRef(null);
  const chart_elements = useRef(null);

  const isVisible = useIsVisible(chartRef, { once: true });

  // Use chroma to make the color scale.
  // https://gka.github.io/chroma.js/
  const scaleMax = 3;
  const scaleMin = -3;
  const f = chroma.scale('RdYlBu').domain([scaleMax, 0, scaleMin]);
  const f_text = chroma.scale(['red', 'rgba(0, 0, 0, 0.3)', 'blue']).padding(-1).domain([scaleMax, 0, scaleMin]);

  const xScale = d3.scaleLinear().range([0, 200]).domain([-1, 124]);
  const yScale = d3.scaleLinear().range([40, 0]).domain([-1, 1]);

  const interval = useRef(null);
  const scales = [];
  let temperature = scaleMin;
  while (temperature < scaleMax) {
    temperature += 0.05;
    scales.push(temperature);
  }

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  const [initialAnimationDone, setInitialAnimationDone] = useState(false);
  const [currentYear, setCurrentYear] = useState(startYear);
  const [fullData, setFullData] = useState(false);
  const [currentAvgTemp, setCurrentAvgTemp] = useState('');
  const [rangeDisabled, setRangeDisabled] = useState(true);

  const getData = useCallback(() => {
    const file_path = `${(window.location.href.includes('unctad.org')) ? 'https://storage.unctad.org/2025-cop30/' : (window.location.href.includes('localhost:80')) ? './' : 'https://unctad-infovis.github.io/2025-cop30/'}`;
    d3.json(`${file_path}assets/data/data.json`).then((data) => {
      x.domain(data[startYear].map(d => d.id));
      setFullData(data);
      // Object.keys(data).forEach((year) => {
      //   let temperature = data[year].reduce((accumulator, current, index, array) => (accumulator + current.temp), 0) / data[year].length;
      //   avg_temps.push(temperature);
      // });
    });
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const createLineChart = useCallback(() => {
    const line_container = chart_elements.current.append('g')
      .attr('class', 'line_container')
      .attr('transform', `translate(${width / 2 + 230}, 20)`);
    line_container.append('text')
      .attr('x', 5)
      .attr('class', 'linegraptext')
      .html('world');
    line_container.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .ticks(1)
        .tickFormat(i => `${i}°C`)
        .tickSizeInner(-200)
        .tickSizeOuter(0));
    // Add the lines.
    line_container.append('path')
      .attr('class', 'current_avg_temp_line')
      .data([]);
  }, [width, yScale]);

  const updateLineChart = useCallback(() => {
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d));
    chart_elements.current.select('.current_avg_temp_line')
      .attr('class', 'current_avg_temp_line')
      .style('stroke', '#000')
      .attr('d', line(avg_temps.slice(0, currentYear - 1900)));
  }, [currentYear, xScale, yScale]);

  const getCurrentYearAverageTemp = useCallback(() => {
    setCurrentAvgTemp(avg_temps[currentYear - 1901].toFixed(1));
  }, [currentYear]);

  const createCenterContainer = useCallback(() => {
    const center_diameter = 175;
    chart_elements.current.append('g')
      .attr('transform', `translate(${width / 2 - center_diameter / 2},${height / 2 - center_diameter / 2})`)
      .append('foreignObject')
      .style('width', `${center_diameter}px`)
      .style('height', `${center_diameter}px`)
      .html(`<div class="center_container" style="width: ${center_diameter}px; height: ${center_diameter}px;"></div>`);
    chart_elements.current.append('g')
      .attr('class', 'center_text')
      .append('text')
      .attr('y', height / 2)
      .style('text-anchor', 'middle')
      .html(`<tspan class="year_text"x="${width / 2}" y="${(height / 2) - 35}">Year</tspan><tspan class="year" x="${width / 2}" y="${(height / 2) + 15}">${currentYear}</tspan><tspan class="temp" x="${width / 2}" y="${(height / 2) + 45}">${currentAvgTemp}</tspan>`);
  }, [currentAvgTemp, currentYear, height, width]);

  const updateCenterContainer = useCallback(() => {
    d3.select('.center_text').select('text').select('.year').html(currentYear);
    d3.select('.center_text').select('text').select('.temp').attr('fill', f_text(currentAvgTemp))
      .html(`${((currentAvgTemp > 0) ? '+' : '') + currentAvgTemp}°C`);
  }, [currentAvgTemp, currentYear, f_text]);

  useEffect(() => {
    updateCenterContainer();
  }, [currentAvgTemp, updateCenterContainer]);

  const createRadialBars = useCallback((data) => {
    chart_elements.current.append('g')
      .attr('class', 'bars_container')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('data-id', d => d.id)
      .attr('fill', d => f(d.temp))
      .attr('d', d3.arc()
        .innerRadius(y(my_domain[0]))
        .outerRadius(d => ((d.temp !== null) ? y(d.temp) : y(my_domain[0])))
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius))
      .style('pointer-events', 'none')
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .delay((d, i) => i * 10)
      .attr('opacity', 1);
  }, [f, height, width]);

  const updateRadialBars = useCallback((data) => {
    d3.selectAll('.bars_container')
      .selectAll('path')
      .transition()
      .duration(100)
      .attr('fill', d => ((d.temp !== null) ? f(data.find(element => element.id === d.id).temp) : y(my_domain[0])))
      .attr('d', d3.arc()
        .innerRadius(y(my_domain[0]))
        .outerRadius(d => ((d.temp !== null) ? y(data.find(element => element.id === d.id).temp) : y(my_domain[0])))
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius));
  }, [f]);

  const createRadialRings = useCallback(() => {
    const chart_legend_rings = chart_elements.current.append('g').attr('class', 'chart_legend_rings');
    chart_legend_rings.selectAll('circle')
      .data(legend_ring_points)
      .join('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', d => y(d))
      .style('fill', 'none')
      .style('stroke', d => ((d === 0) ? '#fff' : '#fff'))
      .style('stroke-width', d => ((d === 0) ? 4 : 2))
      .style('pointer-events', 'none');
    chart_legend_rings.selectAll('text')
      .data(legend_ring_points)
      .join('text')
      .attr('x', d => width / 2 + y(d) + 3)
      .attr('y', height / 2 + 3)
      .text(d => ((d > 0) ? `+${d}.0°C` : `${d}.0°C`))
      .style('opacity', 0.7)
      .style('font-size', d => ((d === 0) ? '12pt' : '10pt'))
      .style('font-weight', d => ((d === 0) ? 700 : 400))
      .style('pointer-events', 'none');
  }, [height, width]);

  const createBarInfo = useCallback((data) => {
    chart_elements.current.append('g')
      .attr('class', 'bars_info_container')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('g')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar_info_container')
      .attr('id', d => d.id)
      .attr('opacity', 0.8)
      .attr('transform', d => `rotate(${((x(d.id) + x.bandwidth() / 2) * 180) / Math.PI - 90})`)
      .attr('text-anchor', d => ((x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? 'end' : 'start'))
      .each((bar_data, i, nodes) => {
        const group = d3.select(nodes[i]);
        // Name.
        group.append('text')
          .attr('data-id', d => d.id)
          .attr('x', d => ((x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? -y(my_domain[1]) - 10 : y(my_domain[1]) + 10))
          .attr('y', 0)
          .text(d => (d.temp !== null ? d.id : ''))
          .style('font-size', '8pt')
          .style('dominant-baseline', 'middle')
          .attr('transform', d => ((x(d.id) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? 'rotate(180)' : 'rotate(0)'));
        // Radial line
        if (bar_data.temp !== null) {
          group.append('line')
            .attr('x1', 87)
            .attr('x2', y(my_domain[1]) + 5)
            .attr('y1', 0)
            .attr('y2', 0)
            .style('opacity', 0.4)
            .style('stroke', '#000')
            .style('stroke-width', 0.15);
        }
      })
      .style('pointer-events', 'none');

    const continents_data = [{ name: 'Africa', value: 40 }, { name: 'Asia', value: 42 }, { name: 'Europe', value: 49 }, { name: 'Oceania', value: 20 }, { name: 'N. America', value: 35 }, { name: 'S. America', value: 11 }];

    const pie = d3.pie()
      .startAngle((95 * Math.PI) / 180)
      .endAngle(((85 * Math.PI) / 180) + (2 * Math.PI))
      .value(d => d.value)
      .sort(null);

    chart_elements.current.append('g')
      .attr('class', 'continent_arcs')
      .selectAll('path')
      .data(pie(continents_data))
      .enter()
      .append('path')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .attr('d', d3.arc().innerRadius(300).outerRadius(301))
      .style('fill', 'transparent')
      .each((d, i, nodes) => {
        const first_arc_section = /(^.+?)L/;
        let new_arc = first_arc_section.exec(d3.select(nodes[i]).attr('d'))[1].replace(/,/g, ' ');
        // Reverse the path if needed.
        if (d.endAngle > ((90 * Math.PI) / 180) && d.endAngle < ((270 * Math.PI) / 180)) {
          const start_loc = /M(.*?)A/;
          const middle_loc = /A(.*?)0 0 1/;
          const end_loc = /0 0 1 (.*?)$/;
          const new_start = end_loc.exec(new_arc)[1];
          const new_end = start_loc.exec(new_arc)[1];
          const middle_sec = middle_loc.exec(new_arc)[1];
          new_arc = `M${new_start}A${middle_sec}0 0 0 ${new_end}`;
        }
        d3.select('.continent_arcs').append('path')
          .attr('class', 'hidden_continent_arcs')
          .attr('id', `continent_arc${i}`)
          .attr('d', new_arc)
          .attr('transform', `translate(${width / 2},${height / 2})`)
          .style('fill', 'none');
      });

    // Append the continent names within the arcs.
    chart_elements.current.append('g')
      .attr('class', 'continent_text')
      .selectAll('text')
      .data(pie(continents_data))
      .enter()
      .append('text')
      .attr('dy', d => (d.endAngle > ((90 * Math.PI) / 180) && d.endAngle < ((270 * Math.PI) / 180) ? 10 : 0))
      .append('textPath')
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .attr('xlink:href', (d, i) => `#continent_arc${i}`)
      .text((d) => d.data.name);
  }, [height, width]);

  const onMouseOver = (event, d) => {
    if (d.temp !== null) {
      d3.select('.bars_container')
        .selectAll(`path:not(path[data-id="${d.id}"])`)
        .style('opacity', 0.2);
      d3.select('.bars_info_container')
        .select(`text[data-id="${d.id}"]`)
        .style('opacity', 1);
      d3.select('.bars_info_container')
        .selectAll(`text:not(text[data-id="${d.id}"])`)
        .style('opacity', 0.2);
      d3.select(event.currentTarget).style('opacity', 1);

      const tooltip = d3.select(appRef.current).select('.tooltip');

      // Get container position
      const containerRect = appRef.current.getBoundingClientRect();

      // Mouse position relative to container
      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;

      // Set tooltip position
      tooltip
        .style('left', `${mouseX + 20}px`)
        .style('top', `${mouseY + 20}px`)
        .style('opacity', 1)
        .html(() => {
          if (d.temp === null || d.temp === undefined) {
            return `${countries[d.id] || d.id}: N/A`;
          }
          const sign = d.temp > 0 ? '+' : '';
          return `${countries[d.id] || d.id}: ${sign}${d.temp}°C`;
        });
    }
  };

  const onMouseOut = (event) => {
    d3.select(event.currentTarget).style('opacity', 0.8);
    d3.select('.bars_container')
      .selectAll('path')
      .style('opacity', 1);
    d3.select('.bars_info_container')
      .selectAll('text')
      .style('opacity', 1);
    d3.select(appRef.current).select('.tooltip')
      .style('opacity', 0);
  };

  const createInteractiveLayer = useCallback((data) => {
    // Interactive layer.
    chart_elements.current.selectAll('.bars_aux').remove();
    chart_elements.current.append('g')
      .attr('class', 'bars_aux')
      .attr('transform', `translate(${width / 2},${height / 2})`)
      .selectAll('a')
      .data(data)
      .enter()
      .append('a')
      .attr('target', '_blank')
      // .attr('href', '')
      .append('path')
      .attr('class', 'aux')
      .attr('data-id', d => d.id)
      .attr('fill', 'transparent')
      .attr('d', d3.arc()
        .innerRadius(inner_radius)
        .outerRadius(outer_radius + 35)
        .startAngle(d => x(d.id))
        .endAngle(d => x(d.id) + x.bandwidth())
        .padRadius(inner_radius))
      // https://stackoverflow.com/questions/63693132/unable-to-get-node-datum-on-mouseover-in-d3-v6
      .on('mouseover', (event, d) => onMouseOver(event, d))
      .on('mouseout', (event, d) => onMouseOut(event, d));
  }, [height, width]);

  const handleSliderValueChange = (event) => {
    // If year is changed manually we stop the interval.
    clearInterval(interval.current);
    const year = parseInt(event.target.value, 10);
    setCurrentYear(year);
    // Create the interactive layer.
    createInteractiveLayer(fullData[year]);
  };

  const createRadialChart = useCallback((data) => {
    // Define contants.
    // Create the svg.
    const svg = d3.select(appRef.current).select('.chart_container')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .classed('svg-content', true);

    // Svg chart container.
    chart_elements.current = svg.append('g')
      .attr('class', 'chart_elements')
      .attr('transform', 'translate(0, 0)');
    // Create radial bars.
    createRadialBars(data);
    // Create the center container.
    createCenterContainer();
    // Create radial rings.
    createRadialRings();
    // Create bar info.
    createBarInfo(data);
    // Create line chart.
    createLineChart();
    getCurrentYearAverageTemp(data);

    setTimeout(() => {
      interval.current = setInterval(() => {
        setCurrentYear(prevYear => prevYear + 1);
      }, 300);
      setRangeDisabled(false);
      setInitialAnimationDone(true);
    }, 2800);
  }, [createBarInfo, createRadialRings, createCenterContainer, createLineChart, createRadialBars, getCurrentYearAverageTemp, height, width]);

  useEffect(() => {
    if (fullData && !d3.select(chartRef.current).select('svg').empty() && initialAnimationDone === true) {
      getCurrentYearAverageTemp(fullData[currentYear]);
      updateLineChart();
      updateRadialBars(fullData[currentYear]);
      if (currentYear >= lastYear) {
        clearInterval(interval.current);
        createInteractiveLayer(fullData[currentYear]);
      }
    }
  }, [currentYear, initialAnimationDone, getCurrentYearAverageTemp, fullData, createInteractiveLayer, updateRadialBars, updateLineChart]);

  useEffect(() => {
    if (fullData && d3.select(chartRef.current).select('svg').empty() && isVisible === true) {
      createRadialChart(fullData[currentYear]);
    }
  }, [createRadialChart, currentYear, fullData, isVisible]);

  useEffect(() => {
    if (appRef.current) {
      setWidth(chartRef.current.clientWidth + 180);
      setHeight(chartRef.current.clientWidth + 180);
    }

    const handleResize = () => {
      if (appRef.current) setWidth(appRef.current.clientWidth + 180);
      if (appRef.current) setHeight(appRef.current.clientWidth + 180);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app" ref={appRef}>
      <div className="title_container">
        <div className="text_container">
          <div className="main_title_container">
            <img src="https://static.dwcdn.net/custom/themes/unctad-2024-rebrand/Blue%20arrow.svg" className="logo" alt="UN Trade and Development logo" />
            <div className="title">
              <h3>Temperatures on the rise</h3>
              <h4>
                Combined mean land-surface air and sea-surface water temperature anomalies (land-ocean temperature index, L-OTI) and average surface air Temperature for countries based on historical observations from the CRU 0.5° dataset, 1901–2024
              </h4>
            </div>
          </div>
        </div>
      </div>
      <div className="range_container">
        <div>
          <span className="label">{startYear}</span>
          <input type="range" min={startYear} max={lastYear} disabled={rangeDisabled} value={currentYear} onChange={(event) => handleSliderValueChange(event)} />
          <span className="label">{lastYear}</span>
        </div>
      </div>
      <div className="chart_container" ref={chartRef} />
      <div className="scales_wrapper">
        <div className="scales_container">
          {
          scales.map((scale) => ((scale > -0.025 && scale < 0.025) ? (<div key={scale} className="scale_container" style={{ backgroundColor: f(scale), borderLeft: '1px dashed rgba(0, 0, 0, 0.3)' }}><div className="scale_text_zero"><div>0°C</div></div></div>) : (<div key={scale} className="scale_container" style={{ backgroundColor: f(scale) }} />)))
        }
        </div>
      </div>
      <div className="caption_container">
        <em>Source:</em>
        {' '}
        UN Trade and Development (UNCTAD), based on data from
        {' '}
        <a href="https://data.giss.nasa.gov/gistemp/">NASA</a>
        {' '}
        and
        {' '}
        <a href="https://climateknowledgeportal.worldbank.org/download-data">World Bank</a>
        .
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
