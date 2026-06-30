/*
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';

interface BdpLogoProps {
  className?: string;
  isDarkMode?: boolean;
}

export const BdpLogo: React.FC<BdpLogoProps> = ({ className = "h-12 w-auto", isDarkMode = false }) => {
  return (
    <img 
      src="https://www.bdp.com.bo/wp-content/uploads/2022/04/BDP_Logo-SVG.svg" 
      alt="Banco de Desarrollo Productivo" 
      className={`${className} object-contain`}
      style={{ display: 'inline-block' }}
    />
  );
};
