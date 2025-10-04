export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-600 mb-4">If you can see this styled page, Tailwind is working!</p>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          Test Button
        </button>
        <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500">
          <p className="text-yellow-700">This should be a yellow alert box</p>
        </div>
      </div>
    </div>
  )
}