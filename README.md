# Art Design Pro 内网版

基于 [Art Design Pro](https://github.com/Daymychen/art-design-pro)（Vue 3 + TypeScript + Vite + Element Plus）改造的内网运行版本。

## 本次改造内容

1. **移除登录页**
   - 删除登录、注册、忘记密码页面及对应路由。
   - 打开系统直接进入登录后的后台界面；路由守卫会自动完成登录（默认账号见下文）。
   - 同步移除用户菜单中的「文档 / GitHub / 退出登录」等登录相关入口。
2. **移除外网 API 依赖**
   - 原项目通过 apifox 公网 Mock 服务获取数据（`https://m1.apifoxmock.com/...`），已全部替换为同级目录下的本地 FastAPI Mock 服务（`art-design-pro-server`）。
   - 生产环境使用同源接口（`VITE_API_URL=/`），由 FastAPI 同时托管前端静态文件与 `/api` 接口。
3. **Iconify 图标离线化**
   - 原项目图标在运行时从 Iconify 在线 API 获取，内网无法访问。
   - 现已将项目实际使用的图标抽取为本地精简图标集（`src/assets/iconify/offline-icons.json`），应用启动时注册，完全离线渲染。
4. **移除外网链接**
   - 移除快速入口、用户菜单、工作台「关于项目」卡片中的官网 / 文档 / GitHub / B 站等外网链接，改为系统内部页面。

> 改造遵循原项目的设计思想与目录结构，仅做最小化调整：登录态、动态路由、权限、标签页等核心机制均保持原样。

## 目录结构

```
github-repos/
├── art-design-pro/          # 前端项目（本仓库）
└── art-design-pro-server/   # FastAPI Mock 后端（独立目录）
```

## 环境要求

| 环境    | 版本                       |
| ------- | -------------------------- |
| Node.js | >= 20.19.0                 |
| pnpm    | >= 8.8.0                   |
| uv      | >= 0.9（建议使用最新版本） |
| Python  | >= 3.9                     |

内网 npm 源 / Python 源均可正常安装依赖。

## 快速开始

### 1. 启动 Mock 后端

```bash
cd ../art-design-pro-server
uv sync                # 按 uv.lock 安装依赖并创建 .venv
uv run art-design-pro-server
```

后端默认监听 `0.0.0.0:8000`，健康检查：`http://127.0.0.1:8000/api/health`。详细说明见同级目录下的 `art-design-pro-server/README.md`。

### 2. 启动前端（开发模式）

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3006`。开发服务器会把 `/api` 代理到 `http://127.0.0.1:8000`（见 `.env.development`）。

### 3. 生产部署（单端口，推荐）

```bash
pnpm build
```

构建产物位于 `dist/`。启动后端时会自动托管同级的 `../art-design-pro/dist`：

```bash
cd ../art-design-pro-server
uv run art-design-pro-server
```

内网浏览器访问 `http://<服务器IP>:8000` 即可，无需额外 Nginx。

> 如果前端目录名称不同，启动后端时通过环境变量 `FRONTEND_DIST` 指定 dist 的绝对路径。

## 自动登录说明

项目已没有登录页。路由守卫在检测到未登录时，会自动使用以下账号请求登录接口：

| 配置项        | 位置                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| 自动登录账号  | `src/router/guards/beforeEach.ts` 中的 `AUTO_LOGIN_ACCOUNT`                    |
| Mock 账号密码 | `art-design-pro-server/src/art_design_pro_server/mock_data.py` 中的 `ACCOUNTS` |

默认账号：`Super / 123456`（Mock 后端返回 `R_SUPER` 角色，拥有全部菜单权限）。

## 后端接口一览

| 方法 | 路径                            | 说明                                |
| ---- | ------------------------------- | ----------------------------------- |
| POST | `/api/auth/login`               | 登录，返回 token                    |
| GET  | `/api/user/info`                | 当前用户信息（角色、按钮权限）      |
| GET  | `/api/user/list`                | 用户列表（分页、筛选）              |
| GET  | `/api/role/list`                | 角色列表（分页、筛选）              |
| GET  | `/api/v3/system/menus/simple`   | 菜单树（菜单管理页 / 后端权限模式） |
| POST | `/api/common/upload/wangeditor` | 富文本编辑器图片上传                |
| GET  | `/api/health`                   | 健康检查                            |

## 离线图标说明

图标数据由脚本扫描 `src/` 下的 `prefix:icon-name` 生成，只打包实际用到的图标，生成结果已提交到仓库：

```
src/assets/iconify/offline-icons.json
```

构建和运行只需要该文件，**不需要安装任何 `@iconify-json/*` 图标包**。

仅在新增 / 修改图标、需要重新生成时，才需要先安装对应图标集：

```bash
# 1. 安装图标集（仅在重新生成图标时需要）
pnpm add -D @iconify-json/ri @iconify-json/fluent @iconify-json/vaadin @iconify-json/system-uicons @iconify-json/iconamoon @iconify-json/solar

# 2. 在代码中使用图标，例如 icon="ri:home-line"

# 3. 重新生成离线图标数据
pnpm icons:generate
```

## 其他说明

- 权限模式仍由 `.env` 中的 `VITE_ACCESS_MODE` 控制。默认 `frontend`（前端路由控制）；切换为 `backend` 时，菜单数据会从本地 Mock 接口读取，接口已按原项目结构提供。
- Mock 后端数据均为静态数据，重启后会重置；上传文件保存在 `art-design-pro-server/uploads/`。
- 若修改后端端口，需要同步调整 `.env.development` 中的 `VITE_API_PROXY_URL`。
- 生产构建命令：`pnpm build`（包含 `vue-tsc --noEmit` 类型检查 + Vite 打包）。
