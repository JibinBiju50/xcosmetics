'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

const feedbackImages = [
    '/images/feedbacks/cream_feedback1.jpeg',
    '/images/feedbacks/cream_feedback2.jpeg',
    '/images/feedbacks/cream_feedback3.jpeg',
    '/images/feedbacks/bluu-feedback-women1.jpeg',
    '/images/feedbacks/bluu-feedback-women2.jpeg',
    '/images/feedbacks/bluu-feedback-men1.jpeg',
    '/images/feedbacks/bluu-feedback-men2.jpeg',
    '/images/feedbacks/body_lotion_feedback4.jpeg',
];

export default function FeedbackSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Mark as mounted after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    // Touch drag handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
        setScrollLeft(scrollRef.current?.scrollLeft || 0);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 1.5;
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    // Duplicate images for seamless infinite scroll
    const allImages = [...feedbackImages, ...feedbackImages];

    return (
        <section className="bg-white" style={{ padding: '60px 0' }}>
            {/* Title */}
            <div className="container mx-auto px-4 mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 text-center">Customer Feedback</h2>
            </div>

            {/* Scroll Container */}
            <div className="overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex gap-4"
                    style={{
                        animation: mounted ? 'scrollFeedback 60s linear infinite' : 'none',
                        width: 'fit-content',
                        paddingLeft: '16px',
                        WebkitOverflowScrolling: 'touch',
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchMove}
                >
                    {allImages.map((image, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[250px] h-[320px] md:w-[300px] md:h-[400px] relative rounded-xl overflow-hidden shadow-lg"
                        >
                            <Image
                                src={image}
                                alt={`Customer feedback ${(index % feedbackImages.length) + 1}`}
                                fill
                                className="object-cover"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Animation CSS */}
            <style jsx global>{`
        @keyframes scrollFeedback {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </section>
    );
}
