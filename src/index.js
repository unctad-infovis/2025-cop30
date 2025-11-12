import React from 'react';

import { createRoot } from 'react-dom/client';

import Bar from './jsx/Bar.jsx';
import SunBurst from './jsx/SunBurst.jsx';

const containerBar = document.getElementById('app-root-2025-cop30-bar');
if (containerBar) {
  const rootBar = createRoot(containerBar);
  rootBar.render(<Bar />);
}

const containerSunBurst = document.getElementById('app-root-2025-cop30-sunburst');
if (containerSunBurst) {
  const rootSunburst = createRoot(containerSunBurst);
  rootSunburst.render(<SunBurst />);
}
