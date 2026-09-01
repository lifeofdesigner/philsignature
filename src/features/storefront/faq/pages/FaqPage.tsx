import React from 'react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'What is the concentration of PHILZ SIGNATURE extraits?',
      a: 'Our formulations boast an elevated perfume oil concentration of 25% to 35%, ensuring extraordinary longevity, sillage, and intimate evolution on skin.',
    },
    {
      q: 'How long does nationwide shipping take?',
      a: 'Orders within Lagos are fulfilled via express courier in 24 to 48 hours. Nationwide deliveries arrive within 2 to 4 business days.',
    },
    {
      q: 'How do I care for my perfume flacon?',
      a: 'Preserve your flacon in a cool, dark environment away from direct sunlight and sudden temperature variations to protect the precious botanical oils.',
    },
    {
      q: 'Can I request bespoke or private gifting packaging?',
      a: 'Yes. Every order is encased in our signature luxury presentation box. For custom wax seals or monogrammed notes, speak to our Concierge.',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Assistance & Care
        </span>
        <h1 className="font-serif text-4xl text-white font-normal">
          Frequently Inquired
        </h1>
        <p className="text-xs text-luxury-muted font-light leading-relaxed">
          Guidance on formulations, conservation, bespoke delivery, and boutique services.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-luxury-card border border-luxury-border p-6 space-y-2"
          >
            <h3 className="font-serif text-lg text-white font-normal">{faq.q}</h3>
            <p className="text-xs text-luxury-muted leading-relaxed font-light">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

