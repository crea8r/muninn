import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@chakra-ui/icons';

interface BreadcrumbComponentProps {
  label?: string;
}

const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({
  label,
}: BreadcrumbComponentProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumb
      spacing='8px'
      separator={<ChevronRightIcon color='gray.500' />}
      mb={4}
    >
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLink} to='/feed'>
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return isLast && label ? (
          <BreadcrumbItem key={name} isCurrentPage={isLast}>
            <BreadcrumbLink as={RouterLink} to={routeTo}>
              {label}
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem key={name} isCurrentPage={isLast}>
            <BreadcrumbLink as={RouterLink} to={routeTo}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
