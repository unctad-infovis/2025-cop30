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

const avg_temps = [0.086425, -0.049775, -0.155225, -0.227325, -0.0395, 0.0375, -0.138925, -0.176375, -0.2143, -0.17835, -0.1915, -0.1199, -0.104025, 0.085625, 0.133025, -0.091325, -0.216475, -0.074375, -0.010325, 0.01095, 0.0766, -0.011025, 0.004175, 0.006875, 0.04335, 0.179725, 0.0727, 0.0873, -0.0848, 0.1295, 0.194, 0.137675, -0.0153, 0.133175, 0.079875, 0.12945, 0.26135, 0.274725, 0.260025, 0.34182, 0.3624, 0.28776, 0.30208, 0.44512, 0.33164, 0.20018, 0.2143333333, 0.1823666667, 0.18195, 0.1005333333, 0.2424833333, 0.2921166667, 0.3643666667, 0.15805, 0.1253, 0.069, 0.3044333333, 0.3390833333, 0.3016166667, 0.2483333333, 0.3172333333, 0.2847666667, 0.3111833333, 0.07321666667, 0.1624333333, 0.21605, 0.2448166667, 0.18915, 0.32415, 0.2798833333, 0.1647, 0.27715, 0.4113833333, 0.1674, 0.2199666667, 0.1356333333, 0.4225, 0.3316666667, 0.4346333333, 0.5456833333, 0.5906833333, 0.3963, 0.5804333333, 0.4025333333, 0.37905, 0.4548166667, 0.5958166667, 0.6374, 0.5242333333, 0.7158666667, 0.6785666667, 0.4731666667, 0.5113666667, 0.5717666667, 0.72695, 0.6119166667, 0.7437666667, 0.9049166667, 0.6599333333, 0.6635166667, 0.8086, 0.8873666667, 0.8808, 0.8048666667, 0.9575666667, 0.9104166667, 0.9148166667, 0.79295, 0.91985, 0.9997833333, 0.87695, 0.9140666667, 0.9472166667, 1.004583333, 1.15465, 1.294066667, 1.196083333, 1.118283333, 1.2478, 1.276416667, 1.114533333, 1.1564, 1.452833333, 1.552316667];
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
    const centerDiameter = 175;
    const r = centerDiameter / 2;
    const cx = width / 2;
    const cy = height / 2;

    // Get the SVG root
    const svgRoot = d3.select(chart_elements.current.node().ownerSVGElement);

    // Remove old defs
    svgRoot.select('#centerDefs').remove();

    // SAFARI-SAFE DEFS
    const defs = svgRoot.append('defs').attr('id', 'centerDefs');

    // Safari-safe blur filter
    const filter = defs.append('filter')
      .attr('id', 'center-blur')
      .attr('filterUnits', 'objectBoundingBox') // required for Safari stability
      .attr('x', '-50%') // extend filter region
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceGraphic')
      .attr('stdDeviation', 20); // matches CSS blur ~2px

    // Remove previous circles/text
    chart_elements.current.selectAll('.center-bg,.center-text-group').remove();

    // Draw blurred circle
    chart_elements.current.append('circle')
      .attr('class', 'center-bg')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('r', r)
      .attr('fill', 'rgba(255,255,255,0.92)')
      .attr('filter', 'url(#center-blur)'); // SAFARI should now accept this

    // Text group
    const tg = chart_elements.current.append('g')
      .attr('class', 'center_text')
      .attr('text-anchor', 'middle');

    tg.append('text')
      .attr('class', 'year')
      .attr('x', cx)
      .attr('y', cy + 17)
      .style('font-size', '36pt')
      .style('font-weight', '700')
      .text(currentYear);

    tg.append('text')
      .attr('class', 'temp')
      .attr('x', cx)
      .attr('y', cy + 30)
      .style('font-size', '18pt')
      .style('display', 'none')
      .text(currentAvgTemp);
  }, [currentAvgTemp, currentYear, height, width]);

  const updateCenterContainer = useCallback(() => {
    d3.select('.center_text').select('text.year').text(currentYear);
    d3.select('.center_text').select('text.temp').attr('fill', f_text(currentAvgTemp))
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
      .attr('fill', d => f(Math.max(-3, d.temp)))
      .attr('d', d3.arc()
        .innerRadius(y(my_domain[0]))
        .outerRadius(d => ((d.temp !== null) ? y(Math.max(-3, d.temp)) : y(my_domain[0])))
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
      .attr('fill', d => ((d.temp !== null) ? f(Math.max(-3, data.find(element => element.id === d.id).temp)) : y(my_domain[0])))
      .attr('d', d3.arc()
        .innerRadius(y(my_domain[0]))
        .outerRadius(d => ((d.temp !== null) ? y(Math.max(-3, data.find(element => element.id === d.id).temp)) : y(my_domain[0])))
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

    const continents_data = [{ name: 'Africa', value: 58 }, { name: 'Asia', value: 50 }, { name: 'Europe', value: 59 }, { name: 'Oceania', value: 30 }, { name: 'N. America', value: 41 }, { name: 'S. America', value: 14 }];

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
      setHeight(744 + 196);
      setWidth(744 + 196);
    }

    const handleResize = () => {
      if (appRef.current) setHeight(744 + 196);
      if (appRef.current) setWidth(744 + 196);
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
              <h3>Global heating: Temperatures rise across all regions</h3>
              <h4>
                Annual regional mean temperature anomalies relative to a (1951–1980) baseline, celcius, 1901–2024
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
        UN Trade and Development (UNCTAD), based on data from the
        {' '}
        <a href="https://climateknowledgeportal.worldbank.org/download-data" target="_blank" rel="noreferrer">World Bank</a>
        .
        <br />
      </div>
      <div className="tooltip" />
    </div>
  );
}
export default App;
