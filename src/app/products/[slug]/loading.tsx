export default function ProductDetailLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="container mx-auto px-4 md:px-8 lg:px-16">
                {/* Back link skeleton */}
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-6" />

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image skeleton */}
                        <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />

                        {/* Content skeleton */}
                        <div className="space-y-4">
                            <div className="h-5 w-20 bg-pink-200 rounded-full animate-pulse" />
                            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />

                            <div className="flex gap-2 mt-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
                                ))}
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>

                            <div className="space-y-2 mt-6">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <div className="h-12 flex-1 bg-gray-200 rounded-lg animate-pulse" />
                                <div className="h-12 flex-1 bg-gray-200 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
