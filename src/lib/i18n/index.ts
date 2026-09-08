import { ka } from './ka';
import { en } from './en';
import { Language } from '../../types/user';

export const translations = {
  ka,
  en,
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.ka;
}
