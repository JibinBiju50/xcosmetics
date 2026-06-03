import { Mail, MapPin, Building2, User } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | creamXstore',
  description: 'Get in touch with creamXstore for your beauty product needs.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4 py-16 bg-[var(--color-background)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-8 md:p-14 space-y-12 border border-white/50 animate-fadeIn relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-pink-50 rounded-2xl mb-2">
            <Mail className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text)] font-[family-name:var(--font-outfit)]">
            Get in Touch
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto font-[family-name:var(--font-inter)]">
            We'd love to hear from you. Please reach out with any questions or inquiries about our premium beauty products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Trade Name */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--color-border)] group">
            <div className="bg-pink-50 p-4 rounded-xl text-[var(--color-primary)] mb-5 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-2 font-[family-name:var(--font-outfit)]">Trade Name</h3>
            <p className="text-[var(--color-text-muted)] font-medium text-lg">creamxstore</p>
          </div>

          {/* Merchant Name */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--color-border)] group">
            <div className="bg-pink-50 p-4 rounded-xl text-[var(--color-primary)] mb-5 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-2 font-[family-name:var(--font-outfit)]">Merchant Name</h3>
            <p className="text-[var(--color-text-muted)] font-medium text-lg">Sooraj Santhosh</p>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--color-border)] group">
            <div className="bg-pink-50 p-4 rounded-xl text-[var(--color-primary)] mb-5 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-2 font-[family-name:var(--font-outfit)]">Email</h3>
            <a href="mailto:cemirates5@gmail.com" className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium text-lg transition-colors">
              cemirates5@gmail.com
            </a>
          </div>

          {/* Address - Spans full width on desktop */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--color-border)] group">
            <div className="bg-pink-50 p-4 rounded-xl text-[var(--color-primary)] mb-5 group-hover:scale-110 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider mb-2 font-[family-name:var(--font-outfit)]">Address</h3>
            <p className="text-[var(--color-text-muted)] font-medium text-lg leading-relaxed max-w-md mx-auto">
              MADAPPATTU PATHIRUVELIL HOUSE,<br />
              MALLAPPALLY EAST, MALLAPPALLY,<br />
              PATHANAMTHITTA, KERALA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
