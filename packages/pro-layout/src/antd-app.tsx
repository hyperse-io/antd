import { App } from 'antd';
import { get } from '@dimjs/utils';
import { fbaHooks } from '@hyperse/antd';
import { type TPlainObject } from '@hyperse/utils';
export const AntdAppWrapper = (props) => {
  const theme = fbaHooks.useThemeToken();
  const appProviderValue = props.appProviderValue;
  const headerThemeConfig = appProviderValue.headerThemeConfig;
  const sidebarThemeConfig = appProviderValue.sidebarThemeConfig;

  const varStyleList: TPlainObject[] = [
    { '--header-bgColor': headerThemeConfig?.bgColor },
    { '--header-textColor': headerThemeConfig?.textColor },
    { '--header-menuColor': headerThemeConfig?.menuColor },
    {
      '--header-menuActiveTextColor': headerThemeConfig?.menuActiveTextColor,
    },
    { '--header-menuActiveBgColor': headerThemeConfig?.menuActiveBgColor },
    {
      '--header-menuSelectedBgColor': headerThemeConfig?.menuSelectedBgColor,
    },
    {
      '--header-menuSelectedTextColor':
        headerThemeConfig?.menuSelectedTextColor,
    },
    { '--sidebar-bgColor': sidebarThemeConfig?.bgColor },
    { '--sidebar-menuActiveBgColor': sidebarThemeConfig?.menuActiveBgColor },
    {
      '--sidebar-menuActiveTextColor': sidebarThemeConfig?.menuActiveTextColor,
    },
    {
      '--sidebar-menuSelectedBgColor': sidebarThemeConfig?.menuSelectedBgColor,
    },
    {
      '--sidebar-menuSelectedTextColor':
        sidebarThemeConfig?.menuSelectedTextColor,
    },
    {
      '--sidebar-menuSubMenuBgColor': sidebarThemeConfig?.menuSubMenuBgColor,
    },
    { '--sidebar-menuColor': sidebarThemeConfig?.menuColor },
    { '--color-primary': theme.colorPrimary },
  ];
  if (appProviderValue.dark) {
    varStyleList.push({
      '--block-bg-color': get(
        appProviderValue,
        'bgColorConfig.dark.blockBgColor',
        '#000'
      ),
    });
    varStyleList.push({
      '--bg-color': get(
        appProviderValue,
        'bgColorConfig.dark.bgColor',
        '#1b1a1a'
      ),
    });
  } else {
    varStyleList.push({
      '--block-bg-color': get(
        appProviderValue,
        'bgColorConfig.light.blockBgColor',
        '#FFF'
      ),
    });
    varStyleList.push({
      '--bg-color': get(
        appProviderValue,
        'bgColorConfig.light.bgColor',
        '#F2F2F2'
      ),
    });
  }

  let varStyleText = '';
  varStyleList.forEach((item) => {
    const key = Object.keys(item)[0];
    if (item[key]) {
      varStyleText = varStyleText + `${key}:${item[key]};`;
    }
  });
  document.body.style.cssText = `${document.body.style.cssText};${varStyleText}`;

  if (appProviderValue.dark) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
  if (appProviderValue.compact) {
    document.body.classList.add('compact-theme');
  } else {
    document.body.classList.remove('compact-theme');
  }

  return <App className={appProviderValue.className}>{props.children}</App>;
};
