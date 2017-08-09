import React from 'react';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import FlatButton from 'material-ui/FlatButton';
import colors, { ACMECorpGrey } from '../../colors'

const getPathName = (name, streamNames) => streamNames[name] ? streamNames[name] : name;

const createBreadcrumb = ({ pathname }, history, streamNames) => {
  let paths = pathname.trim().split('/');
  if (paths.length < 2 || !paths[1]) return null;

  const accumulatedPath = paths.map((path, index, source) => {
    return index ? '/' + source.slice(1, index + 1).join('/') : '/';
  });

  return paths.map((path, index) => {
    const isLastItem = index === paths.length - 1;
    return (
      <span key={index}>
        <span>
          {index ? <ChevronRight color={colors.lightColor} style={{ height: '16px' }} /> : null}
        </span>
        <FlatButton
          label={index ? getPathName(path, streamNames) : 'Main'}
          disabled={isLastItem}
          style={{ color: isLastItem ? ACMECorpGrey : colors.lightColor }}
          onTouchTap={() => history.push(accumulatedPath[index])} />
      </span>
    );
  })
}

const MainNavbarNavigation = ({ onToggleSidebar, history, route, streamNames, productionActive }) => {
  const textColor = productionActive ? '#f0ebe6' : '#f44336'
  const navbarTitle = productionActive ? 'TruBudget' : 'TruBudget (Test)'
  return (
    <div>
      <div>
        <span style={{ paddingRight: '50px', color: textColor }}>{navbarTitle}</span>
        {createBreadcrumb(route, history, streamNames)}
      </div>

    </div>

  )
}

export default MainNavbarNavigation;
