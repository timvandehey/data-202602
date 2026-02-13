# **Routing**

Juris does not include a built-in routing system, acknowledging that routing is complex and evolving architecture where developers may find better solutions. Instead, Juris provides powerful patterns for building custom state-based routing solutions.

## Why No Built-in Router?

Juris deliberately excludes a built-in routing system. The author acknowledges that routing is a complex and evolving architecture where developers may discover better solutions than any framework author could anticipate.

Instead, Juris provides the foundational patterns - headless components, state management, and reactivity - that enable you to build routing solutions perfectly suited to your application's needs.

## Basic Router Pattern

Simple routing by switching components based on URL state.

**Basic Router Setup**

```javascript
const Router = (props, context) => {
  return {
    render: () => ({
      div: {
        children: () => {
          const path = getState('router.path', '/');
          
          switch (path) {
            case '/':
              return [{ HomePage: {} }];
            case '/about':
              return [{ AboutPage: {} }];
            default:
              return [{ NotFoundPage: {} }];
          }
        }
      }
    })
  };
};
```

## Recommended Pattern: State-Based Routing

The author suggests state-based routing as a more predictable and manageable approach. This pattern uses Juris's headless components to synchronize URL with global state, enabling automatic subscriptions, component mobility, and temporal independence.

**Custom UrlStateSync Implementation**

```javascript
// State-Based Routing with UrlStateSync Headless Component

const UrlStateSync = (props, context) => {
  const { getState, setState } = context;
  
  return {
    hooks: {
      onRegister: () => {
        console.log('🧭 UrlStateSync initializing...');
        
        // Initialize from current URL
        handleUrlChange();
        
        // Listen for browser navigation (back/forward)
        window.addEventListener('hashchange', handleUrlChange);
        window.addEventListener('popstate', handleUrlChange);
        
        console.log('✅ UrlStateSync ready');
      },
      
      onUnregister: () => {
        window.removeEventListener('hashchange', handleUrlChange);
        window.removeEventListener('popstate', handleUrlChange);
      }
    }
    
    // No render method - this is state synchronization only
  };

  function handleUrlChange() {
    const path = window.location.hash.substring(1) || '/';
    const segments = parseSegments(path);
    
    // Inject URL state into global state
    setState('url.path', path);
    setState('url.segments', segments);
    
    console.log('🧭 URL updated:', path);
  }
  
  function parseSegments(path) {
    const parts = path.split('/').filter(Boolean);
    return {
      full: path,
      parts: parts,
      base: parts[0] || '',
      sub: parts[1] || '',
      section: parts[2] || ''
    };
  }
};

// Register as headless component
const juris = new Juris({
  headlessComponents: {
    UrlStateSync: { fn: UrlStateSync, options: { autoInit: true } }
  }
});
```

## Custom Route Guards Implementation

Example implementation of route protection using conditional state injection. You can adapt this pattern for any security requirements your application needs.

**Custom Security Implementation**

```javascript
// Route Guards with Conditional State Injection

const SecureUrlStateSync = (props, context) => {
  const { getState, setState } = context;
  
  // Define route permissions
  const routeGuards = {
    '/admin': ['admin'],
    '/admin/users': ['admin', 'user-management'],
    '/profile': ['authenticated'],
    '/settings': ['authenticated']
  };
  
  return {
    hooks: {
      onRegister: () => {
        handleUrlChange();
        window.addEventListener('hashchange', handleUrlChange);
      }
    }
  };

  async function handleUrlChange() {
    const path = window.location.hash.substring(1) || '/';
    const userPermissions = getState('auth.user.permissions', []);
    const isAuthenticated = getState('auth.isLoggedIn', false);
    
    // Check route guards BEFORE injecting state
    const guardResult = await checkRouteAccess(path, userPermissions, isAuthenticated);
    
    if (guardResult.allowed) {
      // Only inject URL state if authorized
      setState('url.path', path);
      setState('url.segments', parseSegments(path));
    } else {
      // Handle guard failure
      if (guardResult.redirect) {
        window.location.hash = guardResult.redirect;
      } else {
        setState('url.path', '/unauthorized');
        setState('url.segments', parseSegments('/unauthorized'));
      }
    }
  }
  
  async function checkRouteAccess(path, userPermissions, isAuthenticated) {
    // Public routes
    if (!routeGuards[path]) {
      return { allowed: true };
    }
    
    // Check authentication first
    if (!isAuthenticated) {
      return { 
        allowed: false, 
        redirect: '/login',
        reason: 'Authentication required'
      };
    }
    
    // Check permissions
    const requiredPermissions = routeGuards[path];
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasPermission) {
      return { 
        allowed: false, 
        redirect: '/unauthorized',
        reason: 'Insufficient permissions'
      };
    }
    
    return { allowed: true };
  }
};
```

## Navigation Components

Navigation components that automatically track active routes using state subscriptions.

**Reactive Navigation**

```javascript
// Navigation Components Using State-Based Routing

const Navigation = (props, context) => {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/docs', label: 'Docs' },
    { path: '/examples', label: 'Examples' }
  ];

  return {
    render: () => ({
      nav: {
        className: 'navigation',
        children: navItems.map(item => ({
          a: {
            href: '#' + item.path,
            className: () => {
              const currentPath = getState('url.path', '/');
              return currentPath === item.path ? 'nav-link active' : 'nav-link';
            },
            text: item.label,
            onclick: (e) => {
              e.preventDefault();
              // Programmatic navigation updates URL, UrlStateSync handles state
              window.location.hash = item.path;
            },
            key: item.path
          }
        }))
      }
    })
  };
};

const SubNavigation = (props, context) => {
  const subRoutes = [
    { path: '', label: 'Getting Started' },
    { path: 'components', label: 'Components' },
    { path: 'state', label: 'State Management' }
  ];

  return {
    render: () => ({
      nav: {
        className: 'sub-navigation',
        children: () => {
          const currentSub = getState('url.segments.sub', '');
          
          return subRoutes.map(route => ({
            a: {
              href: `#/docs${route.path ? '/' + route.path : ''}`,
              className: currentSub === route.path ? 'sub-nav-link active' : 'sub-nav-link',
              text: route.label,
              onclick: (e) => {
                e.preventDefault();
                window.location.hash = `/docs${route.path ? '/' + route.path : ''}`;
              },
              key: route.path || 'root'
            }
          }));
        }
      }
    })
  };
};
```

## Application Layout with Routing

Complete application layout that renders different components based on URL segments.

**Layout with Nested Routing**

```javascript
// Application Layout with State-Based Routing

const AppLayout = (props, context) => {
  return {
    render: () => ({
      div: {
        className: 'app-layout',
        children: [
          { Header: {} },
          {
            main: {
              className: 'main-content',
              children: () => {
                const segments = getState('url.segments', { base: '' });
                
                // Route to components based on URL state
                switch (segments.base) {
                  case '':
                    return [{ HomePage: {} }];
                  case 'docs':
                    return [{ DocsPage: {} }];
                  case 'examples':
                    return [{ ExamplesPage: {} }];
                  case 'admin':
                    // Only renders if user passed route guards
                    return [{ AdminDashboard: {} }];
                  case 'unauthorized':
                    return [{ UnauthorizedPage: {} }];
                  default:
                    return [{ NotFoundPage: {} }];
                }
              }
            }
          },
          { Footer: {} }
        ]
      }
    })
  };
};

const DocsPage = (props, context) => {
  return {
    render: () => ({
      div: {
        children: [
          { SubNavigation: {} },
          {
            section: {
              className: 'docs-content',
              children: () => {
                const currentSub = getState('url.segments.sub', '');
                
                // Sub-routing based on URL segments
                switch (currentSub) {
                  case 'components':
                    return [{ DocsComponents: {} }];
                  case 'state':
                    return [{ DocsState: {} }];
                  default:
                    return [{ DocsIntro: {} }];
                }
              }
            }
          }
        ]
      }
    })
  };
};
```

## Route-Specific Data Loading

Automatically load data when routes change using headless components that subscribe to URL state.

**Route Data Management**

```javascript
// Route-Specific Data Loading

const RouteDataManager = (props, context) => {
  const { getState, setState, subscribe } = context;
  
  return {
    hooks: {
      onRegister: () => {
        // Listen for route changes and load appropriate data
        subscribe('url.path', handleRouteChange);
        subscribe('url.segments', handleSubRouteChange);
      }
    },
    
    api: {
      preloadRoute: async (path) => {
        // Preload data for route before navigation
        await loadRouteData(path);
      }
    }
  };

  async function handleRouteChange(newPath) {
    console.log('📊 Loading data for route:', newPath);
    
    // Clear previous route data
    setState('route.loading', true);
    setState('route.error', null);
    
    try {
      await loadRouteData(newPath);
    } catch (error) {
      setState('route.error', error.message);
    } finally {
      setState('route.loading', false);
    }
  }
  
  async function loadRouteData(path) {
    switch (path) {
      case '/dashboard':
        if (!getState('dashboard.data')) {
          const dashboardData = await fetchDashboardData();
          setState('dashboard.data', dashboardData);
        }
        break;
        
      case '/profile':
        const userId = getState('auth.user.id');
        if (userId && !getState(`profiles.${userId}`)) {
          const profile = await fetchUserProfile(userId);
          setState(`profiles.${userId}`, profile);
        }
        break;
        
      case '/admin/users':
        if (!getState('admin.users.list')) {
          const users = await fetchUsers();
          setState('admin.users.list', users);
        }
        break;
    }
  }
  
  async function handleSubRouteChange(segments) {
    // Handle sub-route specific data loading
    if (segments.base === 'docs' && segments.sub === 'api') {
      if (!getState('docs.apiReference')) {
        const apiDocs = await fetchApiDocs();
        setState('docs.apiReference', apiDocs);
      }
    }
  }
};
```

## Why State-Based Routing Works Better

State-based routing leverages Juris's core architectural patterns, providing benefits that traditional router libraries cannot match.

**Architectural Benefits in Practice**

```javascript
// Benefits of State-Based Routing

// 1. COMPONENT MOBILITY - Routes work from anywhere
const UserProfile = (props, context) => ({
  render: () => ({
    div: {
      children: [
        {
          h2: { 
            text: () => `Profile for ${getState('url.segments.parts.1', 'user')}`
          }
        },
        {
          nav: {
            children: [
              {
                a: {
                  href: '#/profile/settings',
                  className: () => {
                    const currentPath = getState('url.path');
                    return currentPath === '/profile/settings' ? 'active' : '';
                  },
                  text: 'Settings'
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// 2. TEMPORAL INDEPENDENCE - Components work before URL loads
const Breadcrumbs = (props, context) => ({
  render: () => ({
    nav: {
      className: 'breadcrumbs',
      children: () => {
        const segments = getState('url.segments', { parts: [] });
        
        return segments.parts.map((segment, index) => {
          const path = '/' + segments.parts.slice(0, index + 1).join('/');
          return {
            a: {
              href: '#' + path,
              text: segment,
              key: segment
            }
          };
        });
      }
    }
  })
});

// 3. AUTOMATIC SUBSCRIPTIONS - No manual route listening
const ActiveIndicator = (props, context) => ({
  render: () => ({
    div: {
      className: () => {
        const currentPath = getState('url.path', '/');
        return props.path === currentPath ? 'indicator active' : 'indicator';
      },
      text: () => getState('url.path') === props.path ? '●' : '○'
    }
  })
});

// Usage anywhere in app:
{ ActiveIndicator: { path: '/dashboard' } }
{ ActiveIndicator: { path: '/profile' } }

// 4. BRANCH-AWARE REACTIVITY - Only tracks relevant routes
const ConditionalContent = (props, context) => ({
  render: () => ({
    div: {
      children: () => {
        const route = getState('url.segments.base');
        
        if (route === 'admin') {
          // Only tracks admin.* state when on admin routes
          return [{ 
            AdminStats: { 
              userCount: () => getState('admin.users.count')
            }
          }];
        }
        
        if (route === 'dashboard') {
          // Only tracks dashboard.* state when on dashboard
          return [{ 
            DashboardWidget: { 
              data: () => getState('dashboard.metrics')
            }
          }];
        }
        
        return [{ DefaultContent: {} }];
      }
    }
  })
});
```

## Core Advantages

#### 🚀 Component Mobility

Route-aware components work anywhere in the application tree without framework-specific router configuration.

#### ⏰ Temporal Independence

Components work immediately, even if URL state hasn't loaded yet. No coordination complexity.

#### 🔄 Automatic Subscriptions

Components automatically subscribe to URL changes through normal state patterns. No special router hooks.

#### 🎯 Branch-Aware Reactivity

Components only track route state when actually using it. Natural performance optimization.

#### 🛠️ Customizable Architecture

Build routing solutions perfectly suited to your needs. No Platform limitations.

#### 📦 Headless Foundation

URL synchronization as pure state management. Clean separation of concerns.

## Routing Summary

**Juris doesn't include a built-in router because routing architecture is complex and evolving - developers may find better solutions than any framework author could anticipate. Instead, Juris provides the foundational patterns to build custom routing solutions perfectly suited to your application's unique requirements.**