# **Headless Components**

Business logic components without UI - the foundation for services, data management, and background processing in Juris applications.

## What are Headless Components?

Headless components contain business logic without any UI rendering. They handle services, data management, API calls, real-time connections, and background processing while UI components focus purely on presentation.

#### 🧠 Pure Logic

No render method - only business logic, state management, and services.

#### 🔄 Background Services

Handle API calls, WebSockets, timers, and other background processing.

#### 🔗 Public APIs

Expose methods that UI components can call to trigger actions.

#### ♻️ Lifecycle Hooks

Use onRegister/onUnregister for setup and cleanup.

## Basic Headless Component Structure

Headless components follow a specific structure with lifecycle hooks and public APIs, but no render method.

**Headless Component Pattern**

```javascript
// Basic Headless Component Structure
const DataManager = (props, context) => {
  const { getState, setState, subscribe } = context;
  
  return {
    // Lifecycle hooks for headless components
    hooks: {
      onRegister: () => {
        console.log('📦 DataManager registered');
        // Initialize subscriptions, start services, setup data
        initializeDataSources();
      },
      
      onUnregister: () => {
        console.log('🧹 DataManager cleanup');
        // Cleanup subscriptions, stop services, clear timers
        cleanup();
      }
    },
    
    // Public API for other components to use
    api: {
      loadUser: async (userId) => {
        setState('api.loading', true);
        try {
          const user = await fetch(`/api/users/${userId}`);
          setState('users.current', user);
        } catch (error) {
          setState('api.error', error.message);
        } finally {
          setState('api.loading', false);
        }
      },
      
      refreshData: () => {
        // Refresh all data sources
        loadInitialData();
      }
    }
    
    // No render method - headless components don't render UI
  };

  function initializeDataSources() {
    // Setup initial data loading
    subscribe('auth.user.id', (userId) => {
      if (userId) {
        loadUserData(userId);
      }
    });
  }
  
  function cleanup() {
    // Cleanup any resources
  }
};

// Register as headless component
const juris = new Juris({
  headlessComponents: {
    DataManager: { fn: DataManager, options: { autoInit: true } }
  }
});
```

## Headless Component Registration

Register headless components in the Juris configuration object. Each headless component can have options like autoInit to control when it starts.

**Registration Patterns**

```javascript
// Basic Registration
const juris = new Juris({
  // Regular UI components
  components: {
    UserProfile,
    ProductList,
    Navigation
  },
  
  // Headless components with configuration
  headlessComponents: {
    // Auto-initialize on app start
    UrlStateSync: { fn: UrlStateSync, options: { autoInit: true } },
    SecurityManager: { fn: SecurityManager, options: { autoInit: true } },
    DeviceManager: { fn: DeviceManager, options: { autoInit: true } },
    GeolocationManager: { fn: GeolocationManager, options: { autoInit: true } },
    
    // Manual initialization (autoInit: false or omitted)
    ApiManager: { fn: ApiManager, options: { autoInit: false } },
    DataCache: { fn: DataCache }, // autoInit defaults to false
    
    // With custom options passed to component
    WebSocketManager: { 
      fn: WebSocketManager, 
      options: { 
        autoInit: true,
        url: 'wss://api.example.com/ws',
        reconnectInterval: 3000,
        maxRetries: 5
      }
    },
    
    NotificationManager: {
      fn: NotificationManager,
      options: {
        autoInit: true,
        requestPermission: true,
        defaultIcon: '/icon.png'
      }
    }
  },
  
  layout: {
    div: { children: [{ App: {} }] }
  }
});

// Registration Options Explained:
// - fn: The headless component function
// - options.autoInit: Whether to call onRegister immediately (default: false)
// - options.*: Any custom options passed to component as props

// Manual Registration (after app initialization)
juris.registerHeadlessComponent('CustomService', CustomService, {
  autoInit: true,
  customOption: 'value'
});

// Accessing registered headless components
// They become available in context automatically:
const SomeComponent = (props, { DataManager, ApiManager, WebSocketManager }) => ({
  render: () => ({
    div: {
      text: 'All headless components available via context destructuring'
    }
  })
});
```

## How to Access Headless Components

Headless component APIs are injected directly into the context object, making them accessible through destructuring or direct property access.

**Access Patterns**

```javascript
// Method 1: Direct destructuring from context (Recommended)
const UserProfile = (props, { getState, setState, DataManager, ApiManager }) => ({
  hooks: {
    onMount: () => {
      const userId = getState('auth.user.id');
      if (userId) {
        DataManager.loadUser(userId); // Direct access
      }
    }
  },
  
  render: () => ({
    button: {
      text: 'Refresh Data',
      onclick: () => DataManager.refreshData() // Direct API call
    }
  })
});

// Method 2: Destructure from full context object
const UserProfile = (props, context) => {
  const { getState, setState, DataManager } = context;
  
  return {
    render: () => ({
      button: {
        text: 'Load Data',
        onclick: () => DataManager.loadUser(123)
      }
    })
  };
};

// Method 3: Access directly from context (less preferred)
const UserProfile = (props, context) => {
  const { getState, setState } = context;

  return {
    render: () => ({
      button: {
        text: 'Refresh',
        onclick: () => context.DataManager.refreshData()
      }
    })
  };
};

// How Juris injects headless APIs:
// if (instance.api) {
//     this.context[name] = instance.api;
// }
// 
// This means each headless component's API becomes a direct property
// of the context object, accessible without nested paths.
```

## Headless vs UI Components

Separation of concerns: headless components handle business logic while UI components handle presentation. This creates clean, testable, and reusable architecture.

**Business Logic vs Presentation**

```javascript
// Headless Component (Business Logic Only)
const AuthManager = (props, context) => {
  const { getState, setState, subscribe } = context;
  
  return {
    hooks: {
      onRegister: () => {
        // Initialize auth state
        checkExistingAuth();
        setupTokenRefresh();
      }
    },
    
    api: {
      login: async (email, password) => {
        setState('auth.loading', true);
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
          });
          const { token, user } = await response.json();
          
          setState('auth.token', token);
          setState('auth.user', user);
          setState('auth.isLoggedIn', true);
        } catch (error) {
          setState('auth.error', error.message);
        } finally {
          setState('auth.loading', false);
        }
      },
      
      logout: () => {
        setState('auth.token', null);
        setState('auth.user', null);
        setState('auth.isLoggedIn', false);
        localStorage.removeItem('authToken');
      }
    }
    
    // No render method - pure business logic
  };
};

// UI Component (Presentation Only)
const LoginForm = (props, { getState, setState, AuthManager }) => {
  
  return {
    render: () => ({
      form: {
        className: 'login-form',
        onsubmit: (e) => {
          e.preventDefault();
          const email = getState('form.login.email', '');
          const password = getState('form.login.password', '');
          
          // Call headless component API directly
          AuthManager.login(email, password);
        },
        children: [
          {
            input: {
              type: 'email',
              placeholder: 'Email',
              value: () => getState('form.login.email', ''),
              oninput: (e) => setState('form.login.email', e.target.value)
            }
          },
          {
            input: {
              type: 'password',
              placeholder: 'Password',
              value: () => getState('form.login.password', ''),
              oninput: (e) => setState('form.login.password', e.target.value)
            }
          },
          {
            button: {
              type: 'submit',
              text: () => getState('auth.loading') ? 'Logging in...' : 'Login',
              disabled: () => getState('auth.loading', false)
            }
          },
          {
            div: {
              className: 'error-message',
              text: () => getState('auth.error', ''),
              style: () => ({
                display: getState('auth.error') ? 'block' : 'none'
              })
            }
          }
        ]
      }
    })
  };
};
```

## Real-Time Services

Headless components excel at managing real-time connections, notifications, and background services that need to run independently of UI state.

**WebSocket and Notification Services**

```javascript
// Real-Time Services with Headless Components

const WebSocketManager = (props, context) => {
  const { getState, setState } = context;
  let ws = null;
  let reconnectTimer = null;
  
  return {
    hooks: {
      onRegister: () => {
        console.log('🔌 WebSocket service starting...');
        connect();
      },
      
      onUnregister: () => {
        console.log('🔌 WebSocket service stopping...');
        disconnect();
      }
    },
    
    api: {
      send: (message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        } else {
          console.warn('WebSocket not connected');
        }
      },
      
      getConnectionStatus: () => getState('websocket.status', 'disconnected')
    }
  };

  function connect() {
    const wsUrl = getState('config.websocketUrl', 'ws://localhost:8080');
    
    setState('websocket.status', 'connecting');
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setState('websocket.status', 'connected');
      setState('websocket.error', null);
      
      // Clear any reconnection timer
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (error) {
        console.error('Invalid WebSocket message:', event.data);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState('websocket.error', 'Connection error');
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setState('websocket.status', 'disconnected');
      
      // Auto-reconnect after 3 seconds
      reconnectTimer = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        connect();
      }, 3000);
    };
  }
  
  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }
  
  function handleMessage(data) {
    switch (data.type) {
      case 'user_update':
        setState(`users.${data.userId}`, data.user);
        break;
      case 'notification':
        const notifications = getState('notifications.list', []);
        setState('notifications.list', [...notifications, data.notification]);
        break;
      case 'system_status':
        setState('system.status', data.status);
        break;
    }
  }
};

const NotificationManager = (props, context) => {
  const { getState, setState, subscribe } = context;
  
  return {
    hooks: {
      onRegister: () => {
        // Subscribe to new notifications
        subscribe('notifications.list', handleNewNotifications);
        
        // Request notification permission
        if ('Notification' in window) {
          Notification.requestPermission();
        }
      }
    },
    
    api: {
      showNotification: (title, options = {}) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, options);
        }
      },
      
      markAsRead: (notificationId) => {
        const notifications = getState('notifications.list', []);
        const updated = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        setState('notifications.list', updated);
      },
      
      clearAll: () => {
        setState('notifications.list', []);
      }
    }
  };
  
  function handleNewNotifications(notifications) {
    const unread = notifications.filter(n => !n.read);
    
    // Show browser notification for latest unread
    if (unread.length > 0) {
      const latest = unread[unread.length - 1];
      context.headless.NotificationManager.showNotification(
        latest.title, 
        { body: latest.message, icon: '/icon.png' }
      );
    }
    
    // Update unread count
    setState('notifications.unreadCount', unread.length);
  }
};
```

## Data Management Services

Handle API requests, caching, data synchronization, and other data-related operations in dedicated headless components.

**API and Cache Management**

```javascript
// Data Management with Headless Components

const ApiManager = (props, context) => {
  const { getState, setState, subscribe } = context;
  const requestQueue = [];
  let isProcessing = false;
  
  return {
    hooks: {
      onRegister: () => {
        console.log('🌐 API Manager initialized');
        
        // Setup request interceptors
        setupInterceptors();
        
        // Subscribe to auth changes to update headers
        subscribe('auth.token', updateAuthHeaders);
      }
    },
    
    api: {
      get: (url, options = {}) => request('GET', url, null, options),
      post: (url, data, options = {}) => request('POST', url, data, options),
      put: (url, data, options = {}) => request('PUT', url, data, options),
      delete: (url, options = {}) => request('DELETE', url, null, options),
      
      // Batch requests
      batch: (requests) => {
        return Promise.all(requests.map(req => 
          request(req.method, req.url, req.data, req.options)
        ));
      },
      
      // Cached requests
      getCached: async (url, maxAge = 300000) => { // 5 minutes default
        const cacheKey = `cache.${url}`;
        const cached = getState(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < maxAge) {
          return cached.data;
        }
        
        const data = await request('GET', url);
        setState(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    }
  };

  async function request(method, url, data = null, options = {}) {
    const requestId = generateRequestId();
    
    // Add to loading state
    setState(`api.loading.${requestId}`, true);
    
    try {
      const token = getState('auth.token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      };
      
      const config = {
        method,
        headers,
        ...(data && { body: JSON.stringify(data) })
      };
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Clear any previous errors for this endpoint
      setState(`api.errors.${url}`, null);
      
      return result;
      
    } catch (error) {
      console.error(`API Error [${method} ${url}]:`, error);
      setState(`api.errors.${url}`, error.message);
      throw error;
      
    } finally {
      setState(`api.loading.${requestId}`, false);
    }
  }
  
  function setupInterceptors() {
    // Could setup global request/response interceptors here
  }
  
  function updateAuthHeaders(token) {
    // Headers are updated per request, no global state needed
    console.log('🔑 Auth token updated for API requests');
  }
  
  function generateRequestId() {
    return Math.random().toString(36).substring(2, 15);
  }
};

const CacheManager = (props, context) => {
  const { getState, setState } = context;
  
  return {
    hooks: {
      onRegister: () => {
        // Cleanup expired cache entries every 5 minutes
        setInterval(cleanupExpiredCache, 300000);
      }
    },
    
    api: {
      set: (key, value, ttl = 300000) => { // 5 minutes default
        setState(`cache.${key}`, {
          data: value,
          expires: Date.now() + ttl
        });
      },
      
      get: (key) => {
        const cached = getState(`cache.${key}`);
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
          setState(`cache.${key}`, null);
          return null;
        }
        
        return cached.data;
      },
      
      clear: (pattern) => {
        if (pattern) {
          // Clear specific pattern
          const cache = getState('cache', {});
          Object.keys(cache).forEach(key => {
            if (key.includes(pattern)) {
              setState(`cache.${key}`, null);
            }
          });
        } else {
          // Clear all cache
          setState('cache', {});
        }
      },
      
      getStats: () => {
        const cache = getState('cache', {});
        const entries = Object.values(cache).filter(Boolean);
        return {
          totalEntries: entries.length,
          totalSize: JSON.stringify(cache).length,
          oldestEntry: Math.min(...entries.map(e => e.expires))
        };
      }
    }
  };
  
  function cleanupExpiredCache() {
    const cache = getState('cache', {});
    const now = Date.now();
    let cleaned = 0;
    
    Object.entries(cache).forEach(([key, value]) => {
      if (value && value.expires < now) {
        setState(`cache.${key}`, null);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }
};
```

## Device and Browser Services

Manage device capabilities like geolocation, device detection, and browser APIs through headless services.

**Geolocation and Device Detection**

```javascript
// Device Services with Headless Components

const GeolocationManager = (props, context) => {
  const { getState, setState } = context;
  let watchId = null;
  
  return {
    hooks: {
      onRegister: () => {
        console.log('📍 Geolocation service starting...');
        
        // Check if geolocation is supported
        setState('geolocation.isSupported', 'geolocation' in navigator);
        
        // Auto-start if configured
        if (props.autoStart !== false) {
          getCurrentPosition();
        }
      },
      
      onUnregister: () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      }
    },
    
    api: {
      getCurrentPosition: () => getCurrentPosition(),
      startWatching: () => startWatching(),
      stopWatching: () => stopWatching(),
      
      calculateDistance: (lat1, lon1, lat2, lon2) => {
        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }
    }
  };

  function getCurrentPosition() {
    if (!getState('geolocation.isSupported')) {
      setState('geolocation.error', 'Geolocation not supported');
      return;
    }
    
    setState('geolocation.loading', true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState('geolocation.position', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setState('geolocation.loading', false);
        setState('geolocation.error', null);
      },
      (error) => {
        setState('geolocation.error', error.message);
        setState('geolocation.loading', false);
      },
      {
        enableHighAccuracy: props.enableHighAccuracy !== false,
        timeout: props.timeout || 15000,
        maximumAge: props.maximumAge || 300000
      }
    );
  }
  
  function startWatching() {
    if (watchId !== null) return; // Already watching
    
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState('geolocation.position', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
        setState('geolocation.isWatching', true);
      },
      (error) => {
        setState('geolocation.error', error.message);
      }
    );
  }
  
  function stopWatching() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      setState('geolocation.isWatching', false);
    }
  }
};

const DeviceDetector = (props, context) => {
  const { setState } = context;
  
  return {
    hooks: {
      onRegister: () => {
        console.log('📱 Device detection starting...');
        
        updateDeviceInfo();
        
        // Listen for orientation and resize changes
        window.addEventListener('resize', debounce(updateDeviceInfo, 100));
        window.addEventListener('orientationchange', updateDeviceInfo);
      },
      
      onUnregister: () => {
        window.removeEventListener('resize', updateDeviceInfo);
        window.removeEventListener('orientationchange', updateDeviceInfo);
      }
    },
    
    api: {
      getDeviceInfo: () => getState('device', {}),
      forceUpdate: () => updateDeviceInfo()
    }
  };

  function updateDeviceInfo() {
    const deviceInfo = {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      pixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      timestamp: Date.now()
    };
    
    setState('device', deviceInfo);
    console.log('📱 Device info updated:', deviceInfo);
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};
```

## Accessing Headless Component APIs

UI components and other headless components can access headless APIs through the context or global juris instance.

**API Access Patterns**

```javascript
// Accessing Headless Component APIs

// Method 1: Direct destructuring from context (Recommended)
const UserProfile = (props, { getState, setState, DataManager, WebSocketManager, GeolocationManager }) => ({
  hooks: {
    onMount: () => {
      // Access headless component API directly
      const userId = getState('auth.user.id');
      if (userId) {
        DataManager.loadUser(userId);
      }
    }
  },
  
  render: () => ({
    div: {
      className: 'user-profile',
      children: [
        {
          button: {
            text: 'Refresh Data',
            onclick: () => {
              // Call headless API directly
              DataManager.refreshData();
            }
          }
        },
        {
          div: {
            className: 'connection-status',
            text: () => {
              const status = WebSocketManager.getConnectionStatus();
              return `Connection: ${status}`;
            }
          }
        },
        {
          div: {
            className: 'location-info',
            children: () => {
              const position = getState('geolocation.position');
              if (!position) return [{ span: { text: 'Location not available' } }];
              
              return [
                { p: { text: `Lat: ${position.latitude}` } },
                { p: { text: `Lng: ${position.longitude}` } },
                {
                  button: {
                    text: 'Get Current Location',
                    onclick: () => GeolocationManager.getCurrentPosition()
                  }
                }
              ];
            }
          }
        }
      ]
    }
  })
});

// Method 2: Access from full context object
const AlternativeComponent = (props, context) => {
  const { getState, setState, DataManager } = context;
  
  return {
    render: () => ({
      div: {
        text: 'Alternative access pattern',
        onclick: () => DataManager.refreshData()
      }
    })
  };
};

// From Other Headless Components
const AutoSaveManager = (props, { getState, setState, subscribe, ApiManager, NotificationManager }) => {
  let saveTimer = null;
  
  return {
    hooks: {
      onRegister: () => {
        // Subscribe to form changes
        subscribe('form', debounce(autoSave, 2000));
      }
    },
    
    api: {
      forceSave: () => saveNow(),
      enableAutoSave: () => setState('autosave.enabled', true),
      disableAutoSave: () => setState('autosave.enabled', false)
    }
  };

  async function autoSave() {
    const isEnabled = getState('autosave.enabled', true);
    if (!isEnabled) return;
    
    const formData = getState('form', {});
    
    try {
      // Use ApiManager headless component directly
      await ApiManager.post('/api/autosave', formData);
      setState('autosave.lastSaved', Date.now());
      
      // Use NotificationManager directly
      NotificationManager.showNotification(
        'Auto-saved', 
        { body: 'Your changes have been saved automatically' }
      );
    } catch (error) {
      setState('autosave.error', error.message);
    }
  }
  
  function saveNow() {
    if (saveTimer) clearTimeout(saveTimer);
    autoSave();
  }
  
  function debounce(func, wait) {
    return function executedFunction(...args) {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => func(...args), wait);
    };
  }
};

// How Juris injects headless APIs into context:
// if (instance.api) {
//     this.context[name] = instance.api;
// }
// 
// This means headless component APIs become direct properties of context,
// accessible through destructuring or direct property access.
```

## Core Benefits

#### 🎯 Separation of Concerns

Clean separation between business logic and presentation layer. Easier testing and maintenance.

#### ♻️ Reusability

Business logic can be reused across different UI implementations or even different applications.

#### 🔄 Background Processing

Services run independently of UI lifecycle. Perfect for WebSockets, polling, and background tasks.

#### 🧪 Easier Testing

Test business logic without UI concerns. Mock headless components for UI testing.

#### 📦 Service Architecture

Build service-oriented architecture with clean API boundaries between components.

#### ⚡ Performance

No render overhead. Services run efficiently without DOM concerns.

## Best Practices

#### 🔄 Use onRegister/onUnregister

Always use proper lifecycle hooks for setup and cleanup. Never use onMount/onUnmount in headless components.

#### 🎯 Single Responsibility

Each headless component should handle one specific domain or service area.

#### 🔗 Clear APIs

Expose well-defined public APIs that other components can reliably use.

#### 🛡️ Error Handling

Handle errors gracefully and update state to inform UI components of error conditions.

#### 🧹 Resource Cleanup

Always clean up timers, intervals, event listeners, and connections in onUnregister.

#### 📊 State Organization

Use domain-based state paths that match your headless component responsibilities.

## Headless Components Summary

**Headless components are the backbone of Juris applications - handling all business logic, services, and background processing without UI concerns. They provide clean separation of concerns, excellent testability, and enable building robust service-oriented architectures.**