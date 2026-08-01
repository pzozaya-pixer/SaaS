import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [I18nService],
    }).compile();

    service = module.get<I18nService>(I18nService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should translate in Spanish (default)', () => {
    const translation = service.translate('error.not_found');
    expect(translation).toBe('El recurso solicitado no existe.');
  });

  it('should translate in English when accept-language header is sent', () => {
    const translation = service.translate('error.not_found', 'en-US,en;q=0.9');
    expect(translation).toBe('The requested resource does not exist.');
  });

  it('should fallback to Spanish if language is unsupported', () => {
    const translation = service.translate('error.not_found', 'fr-FR');
    expect(translation).toBe('El recurso solicitado no existe.');
  });

  it('should return the key if key does not exist', () => {
    const translation = service.translate('untranslated.key');
    expect(translation).toBe('untranslated.key');
  });
});
