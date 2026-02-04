'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatProps {
  phoneNumber: string;
  message?: string;
}

export default function WhatsAppFloat({ 
  phoneNumber, 
  message = "Hi! I'm interested in your cosmetic products." 
}: WhatsAppFloatProps) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="white" />
    </button>
  );
}