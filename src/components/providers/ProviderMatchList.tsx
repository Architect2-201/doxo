import React from 'react';
import { Provider } from '../../types/provider';
import { useLanguage } from '../../context/LanguageContext';
import { ProviderCard } from './ProviderCard';
import { DOXOOrb } from '../common/DOXOOrb';

interface ProviderMatchListProps {
  providers: Provider[];
  onSelectProvider: (provider: Provider) => void;
  onCancelSearch: () => void;
}

export const ProviderMatchList: React.FC<ProviderMatchListProps> = ({
  providers,
  onSelectProvider,
  onCancelSearch,
}) => {
  const { language, t } = useLanguage();

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DOXOOrb size="sm" state="completed" />
          <h3 className="section-title">
            {language === 'ka' ? `ვიპოვე ${providers.length} საუკეთესო სპეციალისტი` : `Found ${providers.length} Top Specialists`}
          </h3>
        </div>

        <button onClick={onCancelSearch} className="btn btn-ghost btn-sm">
          {language === 'ka' ? 'ძიების გაუქმება' : 'Cancel search'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {providers.map((provider, index) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isRecommended={index === 0}
            onSelect={onSelectProvider}
          />
        ))}
      </div>
    </div>
  );
};
