import { Fragment } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { IoChevronForward } from 'react-icons/io5';

function formatPathname(pathname: string) {
  const pathSegments = pathname.split('/');
  pathSegments.shift();

  return pathSegments.map((part) =>
    part
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function joinPathSegments(pathSegments: string[]) {
  return (
    '/' + pathSegments.map((part) => part.replace(/ /g, '-').toLowerCase()).join('/')
  );
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();

  const pathSegments = formatPathname(pathname);

  return (
    <div className="text-french_gray_2 flex items-center">
      {pathSegments.map((ps, index) => (
        <Fragment key={ps}>
          <Link
            to={joinPathSegments(pathSegments.slice(0, index + 1))}
            className={`${
              index === pathSegments.length - 1
                ? 'text-eerie_black text-lg font-semibold'
                : 'text-french_gray_2'
            }`}
          >
            {ps}{' '}
          </Link>
          {index !== pathSegments.length - 1 && (
            <IoChevronForward size={17} className="mx-1.5" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
