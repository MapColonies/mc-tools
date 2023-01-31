import React from 'react';
import { Box } from '@map-colonies/react-components';

import './PageNotFound.css';

const PageNotFound: React.FC = (): JSX.Element => {

  return (
    <Box className="PageNotFound">
      <Box className="Description">The page you are looking for does not exist</Box>
      <Box className="Title">404</Box>
      <img src="/assets/img/404.png" alt="" />
    </Box>
  );
  
};

export default PageNotFound;
