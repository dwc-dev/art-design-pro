/**
 * 离线图标加载器
 *
 * 用于在内网环境下支持 Iconify 图标的离线加载。
 * 通过预加载本地精简图标集数据，避免运行时从 Iconify 在线 API 获取图标。
 *
 * 图标数据由 scripts/generate-iconify-offline.mjs 扫描项目源码生成，
 * 仅包含项目实际使用的图标，生成命令：pnpm icons:generate
 *
 * 使用方式：直接使用 <ArtSvgIcon icon="ri:home-line" /> 即可
 *
 * @module utils/ui/iconify-loader
 * @author Art Design Pro Team
 */
import { addCollection, type IconifyJSON } from '@iconify/vue'
import offlineIcons from '@/assets/iconify/offline-icons.json'

/**
 * 注册本地离线图标集
 * 必须在应用挂载前调用，确保图标渲染时不再发起外部请求
 */
export function setupOfflineIcons(): void {
  ;(offlineIcons as unknown as IconifyJSON[]).forEach((collection) => {
    addCollection(collection)
  })
}
