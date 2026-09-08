import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { DOXOOrb } from '../common/DOXOOrb';
import { IconArrowRight, IconCheck, IconSparkles } from '../common/Icons';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState(user?.firstName || 'ნუკრი');
  const [city, setCity] = useState(user?.city || 'თბილისი');
  const [district, setDistrict] = useState('ვაკე');

  const handleFinish = () => {
    updateUser({
      firstName: firstName.trim() || 'ნუკრი',
      city,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="460px">
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
          <DOXOOrb size="lg" state="idle" />
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              {language === 'ka' ? 'DOXO ზრუნავს წვრილმანებზე.' : 'DOXO takes care of the little things.'}
            </h3>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {language === 'ka'
                ? 'გაათავისუფლე თავი საყოფაცხოვრებო რუტინისგან. პირადი AI ოპერატორი შენს გვერდითაა.'
                : 'Free yourself from everyday household chores. An AI life operator by your side.'}
            </p>

            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>{language === 'ka' ? 'შემდეგი' : 'Next'}</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Language & Name */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              {language === 'ka' ? 'როგორ მოგმართოთ?' : 'What is your name?'}
            </h3>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {language === 'ka' ? 'მიუთითე შენი სახელი და სასურველი ენა.' : 'Set your name and preferred language.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '24px' }}>
              <div>
                <label className="metadata-text" style={{ display: 'block', marginBottom: '6px' }}>
                  {language === 'ka' ? 'შენი სახელი' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div>
                <label className="metadata-text" style={{ display: 'block', marginBottom: '6px' }}>
                  {language === 'ka' ? 'ინტერფეისის ენა' : 'Language'}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setLanguage('ka')}
                    className={`btn btn-sm ${language === 'ka' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    ქართული (GE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    English (EN)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>{language === 'ka' ? 'შემდეგი' : 'Next'}</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
              {language === 'ka' ? 'სად იმყოფები?' : 'Where are you located?'}
            </h3>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {language === 'ka'
                ? 'DOXO ამ ეტაპზე ოპერირებს თბილისში.'
                : 'DOXO is actively operating in Tbilisi, Georgia.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', marginBottom: '24px' }}>
              <div>
                <label className="metadata-text" style={{ display: 'block', marginBottom: '6px' }}>
                  {language === 'ka' ? 'ქალაქი' : 'City'}
                </label>
                <input
                  type="text"
                  value={city}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                  }}
                />
              </div>

              <div>
                <label className="metadata-text" style={{ display: 'block', marginBottom: '6px' }}>
                  {language === 'ka' ? 'საცხოვრებელი უბანი' : 'Neighborhood'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-secondary)',
                    fontSize: '15px',
                  }}
                >
                  <option value="ვაკე">ვაკე (Vake)</option>
                  <option value="საბურთალო">საბურთალო (Saburtalo)</option>
                  <option value="ვერა">ვერა (Vera)</option>
                  <option value="მთაწმინდა">მთაწმინდა (Mtatsminda)</option>
                  <option value="დიღომი">დიღომი (Dighomi)</option>
                  <option value="დიდუბე">დიდუბე (Didube)</option>
                  <option value="ისანი">ისანი (Isani)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <IconCheck size={16} />
              <span>{language === 'ka' ? 'დაწყება' : 'Get Started'}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
