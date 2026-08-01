import { Injectable } from '@nestjs/common';
import * as esDict from './es.json';
import * as enDict from './en.json';

@Injectable()
export class I18nService {
  private readonly dictionaries: Record<string, Record<string, string>> = {
    es: esDict as unknown as Record<string, string>,
    en: enDict as unknown as Record<string, string>,
  };

  translate(key: string, acceptLanguage?: string): string {
    const lang = this.parseLanguage(acceptLanguage);
    const dict = this.dictionaries[lang] || this.dictionaries.es;
    return dict[key] || key;
  }

  private parseLanguage(acceptLanguage?: string): string {
    if (!acceptLanguage) return 'es';
    const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    return this.dictionaries[primaryLang] ? primaryLang : 'es';
  }
}
