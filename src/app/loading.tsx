export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <h2 className="text-xl text-gray-600">正在加载数据...</h2>
      <p className="text-sm text-gray-500 mt-2">请稍候片刻</p>
    </div>
  );
}
