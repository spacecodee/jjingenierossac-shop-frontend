import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { StorageType } from '@core/data/types/storage-type';
import { CookieOptionsInterface } from '@core/data/interfaces/cookie-options-interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  setItem(
    key: string,
    value: unknown,
    type: StorageType = 'localStorage',
    options?: CookieOptionsInterface
  ): void {
    if (!this.isBrowser) return;

    const serializedValue = JSON.stringify(value);

    switch (type) {
      case 'localStorage':
        localStorage.setItem(key, serializedValue);
        break;
      case 'sessionStorage':
        sessionStorage.setItem(key, serializedValue);
        break;
      case 'cookie':
        this.setCookie(key, serializedValue, options);
        break;
    }
  }

  getItem<T>(key: string, type: StorageType = 'localStorage'): T | null {
    if (!this.isBrowser) return null;

    let value: string | null = null;

    switch (type) {
      case 'localStorage':
        value = localStorage.getItem(key);
        break;
      case 'sessionStorage':
        value = sessionStorage.getItem(key);
        break;
      case 'cookie':
        value = this.getCookie(key);
        break;
    }

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  removeItem(key: string, type: StorageType = 'localStorage'): void {
    if (!this.isBrowser) return;

    switch (type) {
      case 'localStorage':
        localStorage.removeItem(key);
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(key);
        break;
      case 'cookie':
        this.deleteCookie(key);
        break;
    }
  }

  clear(type: StorageType = 'localStorage'): void {
    if (!this.isBrowser) return;

    switch (type) {
      case 'localStorage':
        localStorage.clear();
        break;
      case 'sessionStorage':
        sessionStorage.clear();
        break;
      case 'cookie':
        this.clearAllCookies();
        break;
    }
  }

  private setCookie(name: string, value: string, options: CookieOptionsInterface = {}): void {
    let cookieString = `${ encodeURIComponent(name) }=${ encodeURIComponent(value) }`;

    if (options.expires) {
      const expires =
        options.expires instanceof Date
          ? options.expires
          : new Date(Date.now() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${ expires.toUTCString() }`;
    }

    if (options.path) {
      cookieString += `; path=${ options.path }`;
    } else {
      cookieString += '; path=/';
    }

    if (options.domain) {
      cookieString += `; domain=${ options.domain }`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${ options.sameSite }`;
    }

    document.cookie = cookieString;
  }

  private getCookie(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith(nameEQ)) {
        return decodeURIComponent(trimmedCookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  private deleteCookie(name: string): void {
    this.setCookie(name, '', { expires: new Date(0) });
  }

  private clearAllCookies(): void {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      this.deleteCookie(name);
    }
  }
}
