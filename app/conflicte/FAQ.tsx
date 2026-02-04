'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: openIndex === idx 
              ? "0 8px 24px rgba(0, 0, 0, 0.12)" 
              : "0 4px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <button
            onClick={() => toggleItem(idx)}
            className="w-full text-left p-6 md:p-8 focus:outline-none"
            style={{ color: "#1F2933" }}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg md:text-xl font-semibold pr-4">
                {faq.question}
              </h3>
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300"
                style={{
                  backgroundColor: openIndex === idx ? "#E56B6F" : "#f3f4f6",
                  transform: openIndex === idx ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke={openIndex === idx ? "#FFFFFF" : "#6B7280"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </button>
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: openIndex === idx ? "500px" : "0px",
              opacity: openIndex === idx ? 1 : 0,
            }}
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "#6B7280" }}
              >
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

