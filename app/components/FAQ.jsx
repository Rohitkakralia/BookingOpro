import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "How can I modify my booking?",
      answer: "Contact us via phone or email with your booking reference. Our team will assist you with modifications based on airline/hotel policies."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary by airline and hotel. Please refer to our Changes & Cancellation Policy or contact us for specific details."
    },
    {
      question: "How long does it take to get a refund?",
      answer: "Refund processing typically takes 7-21 business days for flights and 7-14 days for hotels, depending on the supplier and your bank."
    },
    {
      question: "Do you offer travel insurance?",
      answer: "Yes, we can help you arrange travel insurance for your trip. Contact our team during the booking process for more information."
    },
    {
      question: "Can I book flights and hotels together?",
      answer: "Absolutely! We offer comprehensive travel packages that include both flights and hotel accommodations at competitive rates."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, MasterCard, American Express, and Discover through our secure payment gateway."
    }
  ];

  return (
    <div className="bg-gray-50 py-16 px-4 rounded-2xl max-w-7xl mx-auto">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-[#1a3a5c] mb-12">
          Frequently Asked Questions
        </h2>

        {/* FAQ Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border-l-4 border-yellow-400 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#1a3a5c] mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;