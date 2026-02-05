import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function BluuSection() {
  const features = [
    { title: 'Glutathione & Turmeric Extract', desc: 'Boosts natural glow, fights acne & detoxifies skin' },
    { title: 'Kojic Acid & Alpha Arbutin', desc: 'Fades dark spots, reduces tanning & pigmentation' },
    { title: 'Niacinamide & Collagen', desc: 'Minimizes pores, improves elasticity & firmness' },
  ];

  return (
    <section style={{ padding: '60px 16px' }} className="bg-gray-50">
      <div className="container mx-auto" style={{ padding: '0 8px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center" style={{ gap: '32px' }}>
          {/* Left Image */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1 w-full"
            style={{ height: '350px', maxWidth: '500px', margin: '0 auto' }}
          >
            <Image
              src="/images/cream/cream-bluu-men.jpeg"
              alt="Bluu Whitening Cream"
              fill
              className="object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2">
            <span
              className="inline-block bg-pink-100 text-pink-600 text-sm font-semibold rounded-full"
              style={{ padding: '6px 16px', marginBottom: '16px' }}
            >
              NEW LAUNCH
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ marginBottom: '12px' }}>
              Introducing <span className="text-blue-600">bluu</span>
            </h2>
            <h3 className="text-xl text-gray-600" style={{ marginBottom: '24px' }}>Advanced Whitening Cream</h3>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {features.map((feature, index) => (
                <li key={index} className="flex items-start" style={{ gap: '12px' }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center" style={{ marginTop: '2px' }}>
                    <Check size={14} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900" style={{ marginBottom: '4px' }}>{feature.title}</h4>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/products/bluu"
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
              style={{ padding: '14px 32px' }}
            >
              Discover bluu →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}