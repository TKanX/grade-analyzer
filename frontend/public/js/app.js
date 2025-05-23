/**
 * @fileoverview Main Application Class
 * @description The main application class for the frontend.
 */

/**
 * @class Data
 * @description Handles the data of the application.
 */
class Data {
  /**
   * @constructor - Initializes the Data class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;
    this.key = 'appData';
    this._data = this.loadData();

    return this.createProxy(this._data);
  }

  /**
   * @method createProxy - Creates a proxy for the data object.
   * @param {Object} data - The data object to proxy.
   * @returns {Object} - The proxied data object.
   */
  createProxy(data) {
    const handler = {
      set: (target, prop, value) => {
        if (typeof value === 'object' && value !== null) {
          value = this.createProxy(value);
        }
        target[prop] = value;
        this.saveData(); // Save data when any property is set
        return true;
      },
      get: (target, prop) => {
        if (prop in target) {
          if (typeof target[prop] === 'object' && target[prop] !== null) {
            return this.createProxy(target[prop]);
          }
          return target[prop];
        }
        return undefined;
      },
    };

    return new Proxy(data, handler);
  }

  /**
   * @method loadData - Loads data from the local-storage.
   */
  loadData() {
    const storedData = localStorage.getItem(this.key);
    return storedData ? JSON.parse(storedData) : {};
  }

  /**
   * @method saveData - Saves data to the local-storage.
   */
  saveData() {
    localStorage.setItem(this.key, JSON.stringify(this._data));
  }
}

/**
 * @class Cache
 * @description Handles the cache of the application.
 */
class Cache {
  /**
   * @constructor - Initializes the Cache class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;
    this.key = 'appCache';
    this._data = this.loadCache();

    return this.createProxy(this._data);
  }

  /**
   * @method createProxy - Creates a proxy for the cache object.
   * @param {Object} data - The cache object to proxy.
   * @returns {Object} - The proxied cache object.
   */
  createProxy(data) {
    const handler = {
      set: (target, prop, value) => {
        if (typeof value === 'object' && value !== null) {
          value = this.createProxy(value);
        }
        target[prop] = value;
        this.saveCache(); // Save cache when any property is set
        return true;
      },
      get: (target, prop) => {
        if (prop in target) {
          if (typeof target[prop] === 'object' && target[prop] !== null) {
            return this.createProxy(target[prop]);
          }
          return target[prop];
        }
        return undefined;
      },
    };

    return new Proxy(data, handler);
  }

  /**
   * @method loadCache - Loads cache from the session-storage.
   */
  loadCache() {
    const storedCache = sessionStorage.getItem(this.key);
    return storedCache ? JSON.parse(storedCache) : {};
  }

  /**
   * @method saveCache - Saves cache to the session-storage.
   */
  saveCache() {
    sessionStorage.setItem(this.key, JSON.stringify(this._data));
  }
}

/**
 * @class Auth
 * @description Handles the authentication of the application.
 */
class Auth {
  /**
   * @constructor - Initializes the Auth class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.authenticated = false;
    this.userId = this.app.data.auth?.userId;
    this.accessToken = this.app.data.auth?.accessToken;
    this.refreshToken = this.app.data.auth?.refreshToken;
  }

  /**
   * @method init - Initializes the Auth class.
   * @returns {boolean} - True if the user is authenticated, false otherwise.
   */
  async init() {
    this.setFetch();
    if (this.accessToken) {
      this.authenticated = true;
    } else if (this.refreshToken) {
      try {
        await this.authenticate();
        this.authenticated = true;
      } catch (error) {
        return false;
      }
    }
    return this.authenticated;
  }

  /**
   * @method setFetch - Replacement for the fetch function with the access token.
   */
  setFetch() {
    if (!this.accessToken) {
      return;
    }

    window.originalFetch = window.originalFetch || window.fetch;

    window.fetch = async function fetchWithAuth(url, options = {}) {
      if (this.accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${this.accessToken}`,
        };
      }

      const refreshToken = async () => {
        try {
          await this.authenticate();
          options.headers.Authorization = `Bearer ${this.accessToken}`;
          return await window.originalFetch(url, options);
        } catch (error) {
          this.destroy();
          this.app.location.init();
          return null;
        }
      };

      try {
        const response = await window.originalFetch(url, options);
        const UNAUTHORIZED = 401;
        if (response.status === UNAUTHORIZED) {
          return await refreshToken();
        } else {
          return response;
        }
      } catch (error) {
        return await refreshToken();
      }
    }.bind(this);
  }

  /**
   * @method authenticate - Authenticates the user. (refresh JWT token)
   * @throws {Error} - If the token is invalid or expired.
   */
  async authenticate() {
    if (!this.refreshToken) {
      throw new Error('Invalid or expired token.');
    }

    const response = await fetch(`${this.app.apiURL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: this.refreshToken,
      }),
    });

    if (!response.ok) {
      this.authenticated = false;
      this.destroy();
      this.app.location.init();
      throw new Error('Invalid or expired token.');
    } else {
      const data = (await response.json()).data;

      this.authenticated = true;

      this.accessToken = data.accessToken;
      this.app.data.auth.accessToken = data.accessToken;

      this.setFetch();
    }
  }

  /**
   * @method set - Sets the user id and tokens.
   * @param {string} userId - The user ID.
   * @param {string} accessToken - The access token.
   * @param {string} refreshToken - The refresh token.
   * @returns {Object} - The data with the tokens set.
   */
  set(userId, accessToken, refreshToken) {
    this.app.data.auth = {
      userId,
      accessToken,
      refreshToken,
    };
    this.setFetch();
  }

  /**
   * @method destroy - Destroys the tokens.
   */
  destroy() {
    this.app.data.auth = {};
    this.setFetch();
  }
}

/**
 * @class Location
 * @description Handles the location of the application.
 */
class Location {
  /**
   * @constructor - Initializes the Location class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.path = window.location.pathname;
  }

  /**
   * @method init - Initializes the redirect.
   */
  init() {
    if (this.isPublicRoute(this.path)) {
      if (this.isAuthRoute(this.path) && this.app.auth.authenticated) {
        this.redirect(`${this.app.baseURL}/dashboard`);
      }
    } else {
      if (!this.app.auth.authenticated) {
        this.redirect(`${this.app.baseURL}/login?redirect=${this.path}`);
      }
    }
  }

  /**
   * @method isPublicRoute - Checks if the route is public.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route is public, false otherwise.
   */
  isPublicRoute(route) {
    return ![
      '/user',
      '/user/edit',
      '/user/account',
      '/user/settings',
      '/user/security',
      '/user/logout',
    ].includes(route);
  }

  /**
   * @method isAuthRoute - Checks if the route is for authentication purposes.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route is authentication required, false otherwise.
   */
  isAuthRoute(route) {
    return [
      '/login',
      '/register',
      '/register/complete',
      '/password-reset',
      '/password-reset/complete',
    ].includes(route);
  }

  /**
   * @method redirect - Redirects the user to the specified URL.
   * @param {string} url - The URL to redirect to.
   */
  redirect(url) {
    const sanitizedUrl = new URL(url, window.location.origin).href;

    if (
      (sanitizedUrl.startsWith('http') || sanitizedUrl.startsWith('https')) &&
      !sanitizedUrl.startsWith(window.location.origin)
    ) {
      throw new Error('Cannot redirect to an external URL.');
    }

    if (window.location.href !== sanitizedUrl) {
      window.location.href = sanitizedUrl;
    }
  }

  /**
   * @method refresh - Refreshes the page.
   */
  refresh() {
    window.location.reload();
  }

  /**
   * @method showNotFound - Shows the 404 page.
   */
  showNotFound() {
    this.redirect(`${this.app.baseURL}/404?path=${this.path}`);
  }

  /**
   * @method showForbidden - Shows the 403 page.
   */
  showForbidden() {
    this.redirect(`${this.app.baseURL}/403?path=${this.path}`);
  }
}

/**
 * @class UI
 * @description Handles the user interface of the application.
 */
class UI {
  /**
   * @constructor - Initializes the UI class.
   * @param {Object} app - The App class instance.
   */
  constructor(app) {
    this.app = app;

    this.notifications = new Map();

    this.DEFAULT_ALERT_DURATION = 3000;
  }

  /**
   * @method init - Initializes the UI class.
   */
  async init() {
    function init() {
      this.updateHeader(this.app.auth.authenticated);
    }

    document.addEventListener('DOMContentLoaded', init.bind(this));
    if (
      document.readyState === 'complete' ||
      document.readyState === 'interactive'
    ) {
      init.bind(this)();
    }
  }

  /**
   * @method updateHeader - Updates the header based on the authentication status.
   * @param {boolean} authenticated - The authentication status.
   */
  updateHeader(authenticated) {
    const header = document.querySelector('header');

    if (header && authenticated) {
      const loginLink = header.querySelector('[href="/login"]');
      const registerLink = header.querySelector('[href="/register"]');

      if (loginLink) {
        loginLink.textContent = 'Dashboard';
        loginLink.href = '/dashboard';
      }

      if (registerLink) {
        registerLink.textContent = 'Account';
        registerLink.href = '/account';
      }
    }
  }

  /**
   * @method alert - Displays an alert message at the top-left corner of the page.
   * @param {string} message - The message to display.
   * @param {string} status - The status of the alert (e.g., "success", "info", "warning", "error").
   * @param {number} duration - The duration in milliseconds for which the alert should be visible.
   */
  alert(message, status = 'info', duration = this.DEFAULT_ALERT_DURATION) {
    const FADE_IN_DELAY = 10;
    const FADE_OUT_DURATION = 500;

    const COLOR_CLASSES = {
      success: 'text-green-800 border-green-300 bg-green-50',
      info: 'text-blue-800 border-blue-300 bg-blue-50',
      warning: 'text-yellow-800 border-yellow-300 bg-yellow-50',
      error: 'text-red-800 border-red-300 bg-red-50',
      default: 'text-gray-800 border-gray-300 bg-gray-50',
    };

    const alertBox = document.createElement('div');
    const colorClasses = COLOR_CLASSES[status] || COLOR_CLASSES.default;

    alertBox.className = `fixed right-4 top-4 z-50 p-4 text-sm ${colorClasses} border rounded-lg opacity-0 transition-opacity duration-500`;
    alertBox.role = 'alert';
    alertBox.innerHTML = `
    <div class="flex items-center">
      <span>${message}</span>
    </div>`;

    document.body.appendChild(alertBox);

    setTimeout(() => {
      alertBox.classList.add('opacity-100');
    }, FADE_IN_DELAY);

    setTimeout(() => {
      alertBox.classList.remove('opacity-100');
      alertBox.classList.add('opacity-0');

      setTimeout(() => {
        alertBox.remove();
      }, FADE_OUT_DURATION);
    }, duration);
  }

  /**
   * @method notification - Displays a notification message in an element.
   * @param {string} type - The type of notification.
   * @param {string | string[]} message - The message to display.
   * @param {string} status - The status of the notification.
   * @param {HTMLElement} parentElement - The parent element to append the notification to.
   * @param {string} messageGroup - The message group, auto-removes when a new message is added to the group.
   * @returns {HTMLElement} The notification element.
   */
  notification(
    type = 'alert',
    message,
    status = 'info',
    parentElement,
    messageGroup,
  ) {
    const alert = document.createElement('div');

    let colorClasses = '';
    switch (status) {
      case 'success':
        colorClasses = 'text-green-800 border-green-300 bg-green-50';
        break;
      case 'info':
        colorClasses = 'text-gray-800 border-gray-300 bg-gray-50';
        break;
      case 'warning':
        colorClasses = 'text-yellow-800 border-yellow-300 bg-yellow-50';
        break;
      case 'error':
        colorClasses = 'text-red-800 border-red-300 bg-red-50';
        break;
      default:
        colorClasses = 'text-gray-800 border-gray-300 bg-gray-50';
        break;
    }

    if (type === 'alert') {
      alert.className = `flex items-center p-4 mt-2 mb-4 text-sm ${colorClasses} border rounded-lg`;
      alert.role = 'alert';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'flex-shrink-0 inline w-4 h-4 me-3');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('viewBox', '0 0 20 20');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      path.setAttribute(
        'd',
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z',
      );
      svg.appendChild(path);

      const srOnly = document.createElement('span');
      srOnly.setAttribute('class', 'sr-only');
      srOnly.textContent = 'Info';

      const div = document.createElement('div');
      const fontMedium = document.createElement('span');
      fontMedium.setAttribute('class', 'font-medium');
      fontMedium.textContent = message;

      div.appendChild(fontMedium);

      alert.appendChild(svg);
      alert.appendChild(srOnly);
      alert.appendChild(div);
    } else if (type === 'list') {
      alert.className = `flex p-4 mt-2 mb-4 text-sm ${colorClasses} rounded-lg`;
      alert.role = 'alert';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'flex-shrink-0 inline w-4 h-4 me-3 mt-[2px]');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('viewBox', '0 0 20 20');

      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path',
      );
      path.setAttribute(
        'd',
        'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z',
      );
      svg.appendChild(path);

      const srOnly = document.createElement('span');
      srOnly.setAttribute('class', 'sr-only');
      srOnly.textContent = message[0];

      const div = document.createElement('div');

      const fontMedium = document.createElement('span');
      fontMedium.setAttribute('class', 'font-medium');
      fontMedium.textContent = 'Ensure that these requirements are met:';

      const ul = document.createElement('ul');
      ul.setAttribute('class', 'mt-1.5 list-disc list-inside');

      message.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });

      div.appendChild(fontMedium);
      div.appendChild(ul);

      alert.appendChild(svg);
      alert.appendChild(srOnly);
      alert.appendChild(div);
    }

    parentElement.appendChild(alert);

    if (messageGroup) {
      if (this.notifications.has(messageGroup)) {
        this.notifications.get(messageGroup).remove();
      }

      this.notifications.set(messageGroup, alert);
    }

    return alert;
  }
}

/**
 * @class App
 * @description Main application class.
 */
class App {
  /**
   * @constructor - Initializes the App class.
   * @param {string} baseURL - The base URL of the application.
   * @param {string} apiURL - The API URL of the application.
   */
  constructor(baseURL, apiURL) {
    this.baseURL = baseURL;
    this.apiURL = apiURL;

    this.data = new Data(this);
    this.cache = new Cache(this);
    this.auth = new Auth(this);
    this.location = new Location(this);
    this.ui = new UI(this);

    this.init();
  }

  /**
   * @method init - Initializes the App class.
   */
  async init() {
    await this.auth.init();
    this.location.init();
    this.ui.init();
  }
}

// Initialize the App (Client-side)
const app = new App(window.location.origin, '/api');
