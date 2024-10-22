import { type ComponentType, type ReactElement } from 'react';

export type BreadRouteMatchPath = {
  params: Readonly<Record<string, string | undefined>>;
  search: URLSearchParams;
};

export type BreadRoutePathFn = (data: BreadRouteMatchPath) => string;

type RouteBreadConfigData = {
  /**
   * 当前面包屑UI显示名
   */
  name: string | (() => string);
  /**
   * 覆盖`path`如果存在，则点击跳转链接使用to, 通常情况 `path`匹配成功之后，可以指定对应的另外的 `to`来替换当前的`path`作为跳转链接.
   * 支持函数(match)获取计算后的动态`path`
   */
  to?: string | BreadRoutePathFn;
  /**
   * 保留的URL query参数. 默认保留 `env`
   * ```
   * 当 A 携带指定参数（例如id）跳转 B，当在B页面点击面包屑回到A希望携带参数id时，则A的面包屑配置为 { name:'xxx', query:['id'] }
   * ```
   */
  query?: string[];
};

export type RouteBreadConfig =
  | RouteBreadConfigData
  | ((data: BreadRouteMatchPath) => RouteBreadConfigData);

export type BreadConfigItem = {
  path: string;
  breadConfig: RouteBreadConfig;
};

export type BreadDataItem = RouteBreadConfigData & { path: string };

export interface TRouteItemProps {
  path: string;
  element: ReactElement | ComponentType | null;
  redirect?: string;
  caseSensitive?: boolean;
  /**
   * 面包屑配置
   * ```
   * 三种配置方式
   * 1. 直接配置字符串
   * 2. 配置对象 { name:'xxx' }
   * 3. 当存在父子结构的二级路由写法时，需要在此处配置数组，例如：
   *  routeList: [
         {
           path: '/home',
           element: lazy(
             () =>
               import(\/* webpackChunkName: "xxx/xxx/module/chunks/home" *\/ './home')
           ),
           breadConfig: [
             { path: '/', breadConfig: '首页' },
             { path: '/detail', breadConfig: '详情' },
           ],
         }]

     ./home 文件内容
     export default () => {
       return (
         <Routes>
           <Route path="/detail" element={<Detail />} />
           <Route path="/" element={<Home />} />
         </Routes>
       );
     };
   * ```
   */
  breadConfig?:
    | string
    | RouteBreadConfig
    | { path: string; breadConfig: string | RouteBreadConfig }[];
}
