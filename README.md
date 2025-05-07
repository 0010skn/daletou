# 大乐透 AI 量化分析系统

这是一个基于 Next.js 14 开发的大乐透数据 AI 量化分析网站，用于收集和分析大乐透数据，并提供 AI 辅助预测。

## 主要功能

1. **数据收集**：允许用户上传他们已购买的大乐透彩票号码（最多 5 注）
2. **数据验证**：严格验证用户提交的数据是否符合大乐透格式要求
3. **IP 限制**：每个 IP 每小时最多提交 5 注数据
4. **AI 分析**：在开奖前三小时，AI 会基于收集到的数据生成 20 注预测结果
5. **结果展示**：所有用户均可查看 AI 生成的预测结果

## 使用须知

- 只能提交随机购买的彩票号码，不接受自选号码或虚构数据
- 不真实的数据会影响 AI 的分析结果，请务必提交真实数据
- 每个用户每次最多可提交 5 注，每小时最多提交 5 注

## 技术栈

- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Server Actions (用于服务器端数据处理)

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
