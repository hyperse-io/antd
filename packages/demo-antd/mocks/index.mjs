export const getGlobalData = async (hostUrl) => {
  return {
    user: {
      id: '1',
      firstName: 'Tian',
      lastName: 'Yingchun',
      emailAddress: 'test@domain.com',
      user: {
        id: '1',
        identifier: 'admin',
        permissions: [],
      },
    },
    menus: [],
    appName: 'antd',
    elemAclLimits: [],
    defaultPage: `${hostUrl}/pages/hyperse/antd/main/setting/users?env=me`,
    routeBaseName: '/pages/hyperse/antd',
  };
};
