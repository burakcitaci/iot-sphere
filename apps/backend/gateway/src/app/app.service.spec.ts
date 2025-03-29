import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });

    it('should return an object with message property', () => {
      const result = service.getData();
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('getSpanById', () => {
    it('should return a span object with expected properties', () => {
      const spanId = 'test-span-id';
      const result = service.getSpanById(spanId);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('attributes');
      expect(result.name).toBe('GET');
      expect('http.url' in result.attributes).toBe(true);
      expect('http.host' in result.attributes).toBe(true);
      expect('net.host.name' in result.attributes).toBe(true);
      expect('http.method' in result.attributes).toBe(true);
      expect('http.scheme' in result.attributes).toBe(true);
    });

    it('should return correct attribute values', () => {
      const spanId = 'test-span-id';
      const result = service.getSpanById(spanId);

      expect(result.attributes['http.url']).toBe('/api');
      expect(result.attributes['http.host']).toBe('localhost:3010');
      expect(result.attributes['net.host.name']).toBe('localhost');
      expect(result.attributes['http.method']).toBe('GET');
      expect(result.attributes['http.scheme']).toBe('http');
      expect(result.attributes['http.target']).toBe('/api');
      expect(result.attributes['http.status_code']).toBe(200);
      expect(result.attributes['http.status_text']).toBe('OK');
    });
  });
});
