export default function ProductsLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Filter skeleton */}
                <div className="flex gap-4 mb-8">
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                {/* Product grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="h-44 bg-gray-200 rounded-lg animate-pulse mb-4" />
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
                            <div className="h-5 w-full bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
                                ))}
                            </div>
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
                            <div className="flex gap-2">
                                <div className="h-10 flex-1 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
