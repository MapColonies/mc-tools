import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '@map-colonies/react-components';
import appConfig from '../../Utils/Config';

import './Tools.css';

interface IApp {
  category: string;
  name: string;
  icon: string;
  url: string;
  isInternal?: boolean;
  width?: number;
  tooltip?: string;
}

const Tools: React.FC = (): JSX.Element => {

  const [apps] = useState({
    'terrain-verification': { category: 'DEM', name: 'Terrain Verification', icon: 'map-marker.gif', url: '/terrain-verification', isInternal: true, tooltip: 'A Terrain Verification Tool' },
    ...appConfig.apps
  });

  useEffect(() => {
    const numberOfApps = Object.values(apps).length;
    const toolSize = +window.getComputedStyle(document.querySelector('.Tools') as Element).getPropertyValue('--toolSize').slice(0, -2);
    const maxNumberOfTools = Math.floor(window.innerWidth / toolSize);
    const cols = Math.min(maxNumberOfTools, Math.ceil(Math.sqrt(numberOfApps)));
    const rows = Math.ceil(numberOfApps / cols);
    document.documentElement.style.setProperty('--toolsColNum', cols.toString());
    document.documentElement.style.setProperty('--toolsRowNum', rows.toString());
  }, []);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
  };

  const appDetails = (app: IApp): JSX.Element => {
    return (
      <Box className="Details">
        <Box className="Category">{app.category}</Box>
        <Box className="Name">{app.name}</Box>
        <Box><img src={`${appConfig.publicUrl}/assets/img/${app.icon}`} width={app.width} alt="" /></Box>
      </Box>
    );
  };

  const internalTool = (app: IApp, index: number): JSX.Element => {
    return (
      <NavLink key={`${app.category}-${app.name}-${index}`} to={app.url} className="Item">
        {appDetails(app)}
      </NavLink>
    );
  };

  const externalTool = (app: IApp, index: number): JSX.Element => {
    return (
      <Box key={`${app.category}-${app.name}-${index}`} onClick={() => openInNewTab(app.url)} className="Item">
        {appDetails(app)}
      </Box>
    );
  };

  return (
    <Box className="Tools">

      <Box className="Grid">

        {
          (Object.values(apps) as IApp[]).map((app: IApp, index: number): JSX.Element => {
            if (app.tooltip) {
              return (<Tooltip content={app.tooltip}>{app.isInternal ? internalTool(app, index) : externalTool(app, index)}</Tooltip>);
            } else {
              return (<>{app.isInternal ? internalTool(app, index) : externalTool(app, index)}</>);
            }
          })
        }

      </Box>

    </Box>
  );

};

export default Tools;