import React from 'react';
import { PriceQuote } from '../../types/task';
import { Language } from '../../types/user';

interface PriceIndicatorProps {
  quote: PriceQuote;
  lang?: Language;
}

export const PriceIndicator: React.FC<PriceIndicatorProps> = ({ quote, lang = 'ka' }) => {
  const getLabel = () => {
    switch (quote.marketStatus) {
      case 'below_average':
        return lang === 'ka' ? 'კარგი ფასი' : 'Great value';
      case 'normal_range':
        return lang === 'ka' ? 'ნორმალურ დიაპაზონში' : 'In normal market range';
      case 'above_average':
        return lang === 'ka' ? 'საშუალოზე ოდნავ მაღალი' : 'Slightly above average';
      case 'insufficient_data':
      default:
        return lang === 'ka'
          ? 'ფასის შედარებისთვის საკმარისი მონაცემი ჯერ არ გვაქვს'
          : 'Insufficient market data for comparison';
    }
  };

  const getDotColor = () => {
    switch (quote.marketStatus) {
      case 'below_average':
        return 'var(--status-success)';
      case 'normal_range':
        return 'var(--status-info)';
      case 'above_average':
        return 'var(--status-warning)';
      default:
        return 'var(--text-subtle)';
    }
  };

  return (
    <div className="price-indicator-chip" title={quote.explanationText}>
      <span
        className="price-indicator-dot"
        style={{ backgroundColor: getDotColor() }}
      />
      <span>{getLabel()}</span>
    </div>
  );
};
