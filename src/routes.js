import React from 'react'

// Import components directly
import Dashboard from './views/dashboard/Dashboard';
import Colors from './views/theme/colors/Colors';
import Typography from './views/theme/typography/Typography';

//PORTICO
import Coretime from './views/coretime/Coretime';
import RuntimeUpgrade from './views/runtime-upgrade/RuntimeUpgrade';
import Empty from './views/empty/Empty';
import Configurator from './views/configurator/Configurator';
import ConfiguratorRuntime from './views/configurator-runtime/ConfiguratorRuntime';
import ConfiguratorRuntimeSpecs from './views/configurator-runtime/ConfiguratorRuntimeSpecs';
import ConfiguratorCollators from './views/configurator-collators/ConfiguratorCollators';
import ConfiguratorCoretime from './views/configurator-coretime/ConfiguratorCoretime';




const routes = [
  { path: '/', exact: true, name: 'Start Building' , element: Empty},
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/coretime', name: 'Coretime', element: Coretime },
  { path: '/runtime-upgrade', name: 'Runtime Upgrade', element: RuntimeUpgrade },
  { path: '/configure', name: 'Configure Deployment', element: Configurator },
  { path: '/configure/runtime', name: 'Runtime', element: ConfiguratorRuntime },
  { path: '/configure/runtime-specs', name: 'Runtime Specs', element:  ConfiguratorRuntimeSpecs},
  { path: '/configure/collators', name: 'Network Topology', element: ConfiguratorCollators },
  { path: '/configure/coretime', name: 'Coretime', element: ConfiguratorCoretime },


]

export default routes
