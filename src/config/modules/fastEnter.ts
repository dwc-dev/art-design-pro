/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 *
 * 说明：项目改为内网运行，菜单项全部指向系统内部页面，不再包含外网链接。
 */
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'Console'
    },
    {
      name: '用户管理',
      description: '系统用户维护',
      icon: 'ri:group-line',
      iconColor: '#13DEB9',
      enabled: true,
      order: 2,
      routeName: 'User'
    },
    {
      name: '角色管理',
      description: '角色与权限配置',
      icon: 'ri:shield-user-line',
      iconColor: '#7A7FFF',
      enabled: true,
      order: 3,
      routeName: 'Role'
    },
    {
      name: '菜单管理',
      description: '菜单与路由配置',
      icon: 'ri:menu-2-fill',
      iconColor: '#ffb100',
      enabled: true,
      order: 4,
      routeName: 'Menus'
    },
    {
      name: '个人中心',
      description: '个人信息与设置',
      icon: 'ri:user-3-line',
      iconColor: '#38C0FC',
      enabled: true,
      order: 5,
      routeName: 'UserCenter'
    },
    {
      name: '结果页',
      description: '操作结果反馈示例',
      icon: 'ri:checkbox-circle-line',
      iconColor: '#60C041',
      enabled: true,
      order: 6,
      routeName: 'ResultSuccess'
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '工作台',
      enabled: true,
      order: 1,
      routeName: 'Console'
    },
    {
      name: '用户管理',
      enabled: true,
      order: 2,
      routeName: 'User'
    },
    {
      name: '菜单管理',
      enabled: true,
      order: 3,
      routeName: 'Menus'
    },
    {
      name: '个人中心',
      enabled: true,
      order: 4,
      routeName: 'UserCenter'
    }
  ]
}

export default Object.freeze(fastEnterConfig)
