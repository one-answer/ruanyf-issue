# 阮一峰周刊 Issue 查看器

这是一个用于展示 [阮一峰的周刊](https://github.com/ruanyf/weekly) 仓库中 Issues 的网页应用。该应用可以按照类别（标签）对 Issues 进行分类并展示。

## 功能特点

- 从 GitHub API 获取 [ruanyf/weekly](https://github.com/ruanyf/weekly/issues) 仓库的 issues 数据
- 根据 issue 的标签自动分类
- 支持按类别筛选查看 issues
- 显示 issue 的基本信息：标题、作者、创建时间、更新时间、评论数等
- 响应式设计，适配各种设备

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios（用于 API 请求）

## 开发

1. 克隆项目
   ```
   git clone https://github.com/yourusername/ruanyf-issue-viewer.git
   cd ruanyf-issue-viewer
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 配置环境变量（可选）
   创建一个 `.env.local` 文件并添加 GitHub token 以增加 API 请求限制：
   ```
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```
   
   不设置 token 的情况下，GitHub API 限制为每小时 60 次请求，使用 token 后可提高到每小时 5,000 次请求。
   
   获取 token 的方法：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 只需勾选 "public_repo" 权限
   - 创建并复制 token 到 `.env.local` 文件中

4. 启动开发服务器
   ```
   npm run dev
   ```

5. 打开浏览器访问 http://localhost:5173

## 构建部署

```
npm run build
```

构建完成后会在 `dist` 目录生成静态文件，可以部署到任何静态网站托管服务。