/**
 * 离线 Iconify 图标生成脚本
 *
 * 内网环境下无法访问 Iconify 在线 API，因此把项目实际用到的图标
 * 从 @iconify-json/* 图标包中抽取出来，生成精简的本地图标数据，
 * 由 src/utils/ui/iconify-loader.ts 在应用启动时注册。
 *
 * 使用方式：
 *   1. 安装所需图标集（首次或新增图标集时）：
 *      pnpm add -D @iconify-json/ri @iconify-json/fluent @iconify-json/vaadin \
 *        @iconify-json/system-uicons @iconify-json/iconamoon @iconify-json/solar
 *   2. 生成离线图标数据：
 *      pnpm icons:generate
 *
 * 脚本会扫描 src 目录中的 `prefix:icon-name` 形式图标名称，
 * 仅打包被使用的图标，避免引入动辄十几 MB 的完整图标集。
 *
 * 注意：生成结果 src/assets/iconify/offline-icons.json 已提交到仓库，
 * 构建 / 运行不需要安装 @iconify-json/* 图标包，只有在重新生成图标时才需要。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const iconifyDir = path.join(root, 'node_modules', '@iconify-json')
const outputFile = path.join(root, 'src', 'assets', 'iconify', 'offline-icons.json')

const scanDirs = ['src']
const scanExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.vue',
  '.json',
  '.py',
  '.html',
  '.css',
  '.scss'
])

function readInstalledCollections() {
  if (!fs.existsSync(iconifyDir)) {
    return new Map()
  }

  const collections = new Map()
  for (const entry of fs.readdirSync(iconifyDir, { withFileTypes: true })) {
    // pnpm 使用符号链接管理依赖，需要兼容 SymbolicLink
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue
    const file = path.join(iconifyDir, entry.name, 'icons.json')
    if (!fs.existsSync(file)) continue
    collections.set(entry.name, JSON.parse(fs.readFileSync(file, 'utf8')))
  }
  return collections
}

function walkFiles(dir, callback) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue
    }
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(fullPath, callback)
    } else if (scanExtensions.has(path.extname(entry.name))) {
      callback(fullPath)
    }
  }
}

function collectUsedIcons(collections) {
  const used = new Map()
  // 匹配形如 ri:home-line / fluent:arrow-enter-left-20-filled 的图标名称
  const iconPattern = /(["'`])([a-z0-9][a-z0-9-]*):([a-z0-9][a-z0-9-]*)\1/g

  for (const dir of scanDirs) {
    walkFiles(path.join(root, dir), (file) => {
      const content = fs.readFileSync(file, 'utf8')
      for (const match of content.matchAll(iconPattern)) {
        const prefix = match[2]
        const name = match[3]
        if (!collections.has(prefix)) continue
        if (!used.has(prefix)) used.set(prefix, new Set())
        used.get(prefix).add(name)
      }
    })
  }

  return used
}

function resolveAlias(source, name) {
  const alias = source.aliases?.[name]
  if (!alias) return null

  let parent = alias.parent
  const visited = new Set([name])
  while (source.aliases?.[parent] && !source.icons?.[parent]) {
    if (visited.has(parent)) return null
    visited.add(parent)
    parent = source.aliases[parent].parent
  }

  return source.icons?.[parent] ? { alias, parent } : null
}

function buildCollection(prefix, names, source) {
  const icons = {}
  const aliases = {}
  const missing = []

  for (const name of [...names].sort()) {
    if (source.icons?.[name]) {
      icons[name] = source.icons[name]
      continue
    }

    const resolved = resolveAlias(source, name)
    if (resolved) {
      icons[resolved.parent] = source.icons[resolved.parent]
      aliases[name] = { ...resolved.alias, parent: resolved.parent }
      continue
    }

    missing.push(name)
  }

  if (missing.length > 0) {
    console.warn(`⚠️  [${prefix}] 未在图标集中找到：${missing.join(', ')}`)
  }

  return {
    prefix,
    icons,
    ...(Object.keys(aliases).length > 0 ? { aliases } : {}),
    width: source.width ?? 24,
    height: source.height ?? 24
  }
}

function main() {
  const collections = readInstalledCollections()
  if (collections.size === 0) {
    console.error('❌ 未找到 @iconify-json 图标包，请先执行：pnpm add -D @iconify-json/ri')
    process.exit(1)
  }

  const used = collectUsedIcons(collections)
  const result = []
  let totalIcons = 0

  for (const prefix of [...used.keys()].sort()) {
    const collection = buildCollection(prefix, used.get(prefix), collections.get(prefix))
    totalIcons += Object.keys(collection.icons).length
    if (Object.keys(collection.icons).length > 0) {
      result.push(collection)
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2) + '\n')

  const size = (fs.statSync(outputFile).size / 1024).toFixed(1)
  console.log(
    `✅ 已生成 ${path.relative(root, outputFile)}：${result.length} 个图标集，${totalIcons} 个图标，${size} KB`
  )
  console.log(
    `   图标集：${result.map((item) => `${item.prefix}(${Object.keys(item.icons).length})`).join(', ')}`
  )
}

main()
