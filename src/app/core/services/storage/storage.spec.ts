import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${ name }=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localStorage', () => {
    it('should store and retrieve string value', () => {
      service.setItem('testKey', 'testValue', 'localStorage');
      const value = service.getItem<string>('testKey', 'localStorage');
      expect(value).toBe('testValue');
    });

    it('should store and retrieve object value', () => {
      const testObj = { name: 'test', age: 25 };
      service.setItem('testObj', testObj, 'localStorage');
      const value = service.getItem<typeof testObj>('testObj', 'localStorage');
      expect(value).toEqual(testObj);
    });

    it('should return null for non-existent key', () => {
      const value = service.getItem('nonExistent', 'localStorage');
      expect(value).toBeNull();
    });

    it('should remove item', () => {
      service.setItem('testKey', 'testValue', 'localStorage');
      service.removeItem('testKey', 'localStorage');
      const value = service.getItem('testKey', 'localStorage');
      expect(value).toBeNull();
    });

    it('should clear all items', () => {
      service.setItem('key1', 'value1', 'localStorage');
      service.setItem('key2', 'value2', 'localStorage');
      service.clear('localStorage');
      expect(service.getItem('key1', 'localStorage')).toBeNull();
      expect(service.getItem('key2', 'localStorage')).toBeNull();
    });
  });

  describe('sessionStorage', () => {
    it('should store and retrieve value in sessionStorage', () => {
      service.setItem('sessionKey', 'sessionValue', 'sessionStorage');
      const value = service.getItem<string>('sessionKey', 'sessionStorage');
      expect(value).toBe('sessionValue');
    });

    it('should remove item from sessionStorage', () => {
      service.setItem('sessionKey', 'sessionValue', 'sessionStorage');
      service.removeItem('sessionKey', 'sessionStorage');
      const value = service.getItem('sessionKey', 'sessionStorage');
      expect(value).toBeNull();
    });
  });

  describe('cookies', () => {
    it('should store and retrieve value in cookies', () => {
      service.setItem('cookieKey', 'cookieValue', 'cookie');
      const value = service.getItem<string>('cookieKey', 'cookie');
      expect(value).toBe('cookieValue');
    });

    it('should store cookie with options', () => {
      service.setItem('cookieKey', 'cookieValue', 'cookie', {
        path: '/',
        secure: false,
        sameSite: 'Lax',
      });
      const value = service.getItem<string>('cookieKey', 'cookie');
      expect(value).toBe('cookieValue');
    });

    it('should remove cookie', () => {
      service.setItem('cookieKey', 'cookieValue', 'cookie');
      service.removeItem('cookieKey', 'cookie');
      const value = service.getItem('cookieKey', 'cookie');
      expect(value).toBeNull();
    });
  });

  describe('default storage type', () => {
    it('should use localStorage as default', () => {
      service.setItem('defaultKey', 'defaultValue');
      const value = service.getItem<string>('defaultKey');
      expect(value).toBe('defaultValue');
      expect(localStorage.getItem('defaultKey')).toBeTruthy();
    });
  });
});
