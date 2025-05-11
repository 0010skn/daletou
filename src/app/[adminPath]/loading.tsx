export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          加载中...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          正在验证您的访问权限，请稍候...
        </p>
      </div>
    </div>
  );
}
