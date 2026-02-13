# **Control Flow Components**

Comprehensive guide to all control flow components in Juris - manage conditional rendering, loops, async operations, and component composition.

## Control Flow Overview

Control flow components manage how and when other components are rendered. They handle conditional logic, loops, async operations, error boundaries, and dynamic component loading.

#### 🔀 Conditional Logic

Conditional, Switch, Match, Guard - control what renders based on state and conditions.

#### 🔄 Iteration

For, Repeat - render lists and repeated elements with performance optimization.

#### ⚡ Async Operations

Await, Suspense - handle promises, loading states, and async data.

#### 🛡️ Error Handling

ErrorBoundary, Suspense - catch errors and provide fallback UI.

#### 🎯 Dynamic Loading

Dynamic, Portal - load components by name and render outside tree.

#### 👁️ Visibility Control

Show, Fragment - control visibility and DOM structure.

## 1. Conditional Component

Renders content conditionally based on state or function results. Components are completely mounted/unmounted based on the condition.

#### ✅ When to Use

Simple show/hide logic, login states, feature flags, permission-based content.

#### 🔧 Key Features

Mount/unmount behavior, else clauses, function conditions, nested conditionals.

**Conditional Component Usage**

```javascript
// 1. Conditional Component - Show/Hide Content Based on State
const LoginSection = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Toggle Authentication',
            onclick: () => {
              const current = getState('auth.isLoggedIn', false);
              setState('auth.isLoggedIn', !current);
            }
          }
        },
        {
          Conditional: {
            condition: 'auth.isLoggedIn',  // State path or function
            then: {
              div: {
                className: 'welcome-message',
                children: [
                  { h3: { text: 'Welcome back!' } },
                  { p: { text: 'You have full access to the application.' } }
                ]
              }
            },
            else: {
              div: {
                className: 'login-prompt',
                children: [
                  { h3: { text: 'Please log in' } },
                  { p: { text: 'Access denied. Authentication required.' } }
                ]
              }
            }
          }
        }
      ]
    }
  })
});

// Using function-based conditions
const DynamicConditional = (props, { getState }) => ({
  render: () => ({
    Conditional: {
      condition: () => {
        const user = getState('auth.user');
        const permissions = getState('auth.permissions', []);
        return user && permissions.includes('admin');
      },
      then: { AdminPanel: {} },
      else: { AccessDenied: {} }
    }
  })
});

// Multiple conditions
const ComplexConditional = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        {
          Conditional: {
            condition: 'user.isVerified',
            then: {
              Conditional: {
                condition: 'user.hasSubscription',
                then: { PremiumContent: {} },
                else: { UpgradePrompt: {} }
              }
            },
            else: { VerificationRequired: {} }
          }
        }
      ]
    }
  })
});
```

## 2. Switch Component

Handles multiple exclusive conditions, like a switch statement. Perfect for user roles, app states, and multi-option scenarios.

#### ✅ When to Use

User roles, app states, themes, multiple exclusive options.

#### 🔧 Key Features

Multiple cases, default fallback, value functions, clean syntax.

**Switch Component Usage**

```javascript
// 2. Switch Component - Multiple Condition Branches
const UserDashboard = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            className: 'role-selector',
            children: [
              {
                button: {
                  text: 'Admin',
                  onclick: () => setState('auth.role', 'admin')
                }
              },
              {
                button: {
                  text: 'User', 
                  onclick: () => setState('auth.role', 'user')
                }
              },
              {
                button: {
                  text: 'Guest',
                  onclick: () => setState('auth.role', 'guest')
                }
              }
            ]
          }
        },
        {
          Switch: {
            value: 'auth.role',  // State path to switch on
            cases: {
              'admin': {
                div: {
                  className: 'admin-dashboard',
                  children: [
                    { h2: { text: '👑 Admin Dashboard' } },
                    { p: { text: 'Full system access granted' } },
                    { AdminControls: {} }
                  ]
                }
              },
              'user': {
                div: {
                  className: 'user-dashboard', 
                  children: [
                    { h2: { text: '👤 User Dashboard' } },
                    { p: { text: 'Standard user privileges' } },
                    { UserControls: {} }
                  ]
                }
              },
              'guest': {
                div: {
                  className: 'guest-view',
                  children: [
                    { h2: { text: '👀 Guest View' } },
                    { p: { text: 'Limited access only' } }
                  ]
                }
              }
            },
            default: {
              div: {
                className: 'unknown-role',
                text: '❓ Unknown role - please contact administrator'
              }
            }
          }
        }
      ]
    }
  })
});

// Function-based switch values
const StatusSwitch = (props, { getState }) => ({
  render: () => ({
    Switch: {
      value: () => {
        const loading = getState('api.loading', false);
        const error = getState('api.error', null);
        if (loading) return 'loading';
        if (error) return 'error';
        return 'success';
      },
      cases: {
        'loading': { LoadingSpinner: {} },
        'error': { ErrorMessage: { error: () => getState('api.error') } },
        'success': { DataDisplay: {} }
      }
    }
  })
});
```

## 3. For Component

Iterates over arrays with built-in performance optimization. Includes loading states, empty states, and automatic "ignore" optimization.

#### ✅ When to Use

Render lists, user lists, data tables, any array iteration.

#### 🔧 Key Features

Performance optimization, custom keys, loading/empty states, "ignore" behavior.

**For Component Usage**

```javascript
// 3. For Component - Iterate Over Arrays with Performance Optimization
const UserList = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Add User',
            onclick: () => {
              const users = getState('users.list', []);
              const newUser = {
                id: Date.now(),
                name: `User ${users.length + 1}`,
                email: `user${users.length + 1}@example.com`,
                isOnline: Math.random() > 0.5
              };
              setState('users.list', [...users, newUser]);
            }
          }
        },
        {
          For: {
            items: 'users.list',  // State path to array
            render: (user, index) => ({
              div: {
                className: 'user-card',
                key: user.id,  // Automatically added for performance
                children: [
                  { h4: { text: user.name } },
                  { p: { text: user.email } },
                  { 
                    span: { 
                      className: user.isOnline ? 'online' : 'offline',
                      text: user.isOnline ? 'Online' : 'Offline' 
                    } 
                  }
                ]
              }
            }),
            keyPath: 'id',  // Custom key path (default: 'id')
            emptyContent: {
              div: {
                className: 'empty-state',
                children: [
                  { h3: { text: 'No users found' } },
                  { p: { text: 'Click "Add User" to get started!' } }
                ]
              }
            },
            loadingContent: {
              div: { className: 'loading', text: 'Loading users...' }
            },
            loading: 'users.loading'
          }
        }
      ]
    }
  })
});

// Function-based items
const DynamicList = (props, { getState }) => ({
  render: () => ({
    For: {
      items: () => {
        const search = getState('ui.searchTerm', '');
        const allItems = getState('data.items', []);
        return search 
          ? allItems.filter(item => item.name.includes(search))
          : allItems;
      },
      render: (item) => ({ ItemCard: { item } }),
      keyPath: (item, index) => `${item.category}-${item.id}`
    }
  })
});

// Performance Optimization with "ignore"
// The For component automatically optimizes by returning "ignore" 
// when array length hasn't changed, preserving DOM structure
```

## 4. Portal Component

Renders content outside the normal component tree into any DOM element. Perfect for modals, tooltips, and overlays.

#### ✅ When to Use

Modals, tooltips, notifications, dropdowns, overlays.

#### 🔧 Key Features

Custom targets, DOM escape, lifecycle management, multiple portals.

**Portal Component Usage**

```javascript
// 4. Portal Component - Render Content Outside Component Tree
const Modal = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Open Modal',
            onclick: () => setState('ui.showModal', true)
          }
        },
        {
          Conditional: {
            condition: 'ui.showModal',
            then: {
              Portal: {
                target: '#modal-root',  // CSS selector or DOM element
                children: {
                  div: {
                    className: 'modal-overlay',
                    onclick: () => setState('ui.showModal', false),
                    children: [
                      {
                        div: {
                          className: 'modal-content',
                          onclick: (e) => e.stopPropagation(),
                          children: [
                            { h2: { text: 'Modal Title' } },
                            { p: { text: 'This content is rendered in #modal-root!' } },
                            {
                              button: {
                                text: 'Close',
                                onclick: () => setState('ui.showModal', false)
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      ]
    }
  })
});

// Portal to different targets
const NotificationSystem = (props, context) => ({
  render: () => ({
    Portal: {
      target: document.body,  // Direct DOM reference
      children: {
        div: {
          className: 'notification-container',
          children: [
            {
              For: {
                items: 'notifications.list',
                render: (notification) => ({
                  div: {
                    className: 'notification',
                    children: [
                      { span: { text: notification.message } },
                      {
                        button: {
                          text: '×',
                          onclick: () => {
                            // Remove notification logic
                          }
                        }
                      }
                    ]
                  }
                })
              }
            }
          ]
        }
      }
    }
  })
});

// Multiple portals
const MultiPortalExample = () => ({
  render: () => ({
    div: {
      children: [
        {
          Portal: {
            target: '#header-actions',
            children: { HeaderButton: { text: 'Portal Action' } }
          }
        },
        {
          Portal: {
            target: '#sidebar-widgets',
            children: { SidebarWidget: { title: 'Portal Widget' } }
          }
        }
      ]
    }
  })
});
```

## 5. Fragment Component

Groups multiple children without adding an extra wrapper element to the DOM. Keeps HTML structure clean.

#### ✅ When to Use

Avoid wrapper divs, clean HTML structure, conditional groups.

#### 🔧 Key Features

No DOM wrapper, group children, conditional fragments.

**Fragment Component Usage**

```javascript
// 5. Fragment Component - Group Children Without Wrapper
const CardContent = (props, context) => ({
  render: () => ({
    div: {
      className: 'card',
      children: [
        {
          Fragment: {
            children: [
              { h3: { text: props.title } },
              { p: { text: props.description } },
              {
                Fragment: {
                  children: [
                    { span: { text: 'Tags: ' } },
                    {
                      For: {
                        items: () => props.tags || [],
                        render: (tag) => ({
                          span: { className: 'tag', text: tag }
                        })
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        { div: { className: 'card-actions', children: [/* actions */] } }
      ]
    }
  })
});

// Fragment vs Regular Div Comparison
const WithoutFragment = () => ({
  render: () => ({
    div: {
      className: 'container',
      children: [
        {
          div: {  // Extra wrapper div
            children: [
              { h1: { text: 'Title' } },
              { p: { text: 'Content' } }
            ]
          }
        }
      ]
    }
  })
});

const WithFragment = () => ({
  render: () => ({
    div: {
      className: 'container', 
      children: [
        {
          Fragment: {  // No wrapper div in DOM
            children: [
              { h1: { text: 'Title' } },
              { p: { text: 'Content' } }
            ]
          }
        }
      ]
    }
  })
});

// Conditional fragments
const ConditionalFragment = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        { h1: { text: 'Always shown' } },
        {
          Conditional: {
            condition: 'user.showDetails',
            then: {
              Fragment: {
                children: [
                  { h2: { text: 'User Details' } },
                  { p: { text: 'Email: user@example.com' } },
                  { p: { text: 'Role: Administrator' } }
                ]
              }
            }
          }
        }
      ]
    }
  })
});
```

## 6. Guard Component

Permission-based access control component. Shows content only if user has required permissions, with customizable fallback.

#### ✅ When to Use

User permissions, role-based access, feature flags, security.

#### 🔧 Key Features

Permission arrays, requireAll/requireAny, fallback content.

**Guard Component Usage**

```javascript
// 6. Guard Component - Permission-Based Access Control
const PermissionGuard = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            className: 'permission-controls',
            children: [
              {
                button: {
                  text: 'Grant Admin',
                  onclick: () => setState('auth.permissions', ['read', 'write', 'admin'])
                }
              },
              {
                button: {
                  text: 'Grant Write',
                  onclick: () => setState('auth.permissions', ['read', 'write'])
                }
              },
              {
                button: {
                  text: 'Read Only',
                  onclick: () => setState('auth.permissions', ['read'])
                }
              },
              {
                button: {
                  text: 'No Access',
                  onclick: () => setState('auth.permissions', [])
                }
              }
            ]
          }
        },
        {
          Guard: {
            permissions: ['admin'],  // Required permissions
            requireAll: true,        // Must have ALL permissions (default: true)
            children: {
              div: {
                className: 'admin-panel',
                children: [
                  { h3: { text: '🔐 Admin Panel' } },
                  { p: { text: 'Top secret admin content!' } },
                  { button: { text: 'Delete Everything' } }
                ]
              }
            },
            fallback: {
              div: {
                className: 'access-denied',
                children: [
                  { h3: { text: '🚫 Access Denied' } },
                  { p: { text: 'You need admin permissions to view this content.' } }
                ]
              }
            }
          }
        }
      ]
    }
  })
});

// Multiple permission scenarios
const PermissionMatrix = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        {
          Guard: {
            permissions: ['read', 'write'],
            requireAll: false,  // Need ANY of these permissions
            children: { EditableContent: {} },
            fallback: { ReadOnlyMessage: {} }
          }
        },
        {
          Guard: {
            permissions: ['admin', 'moderator'],
            requireAll: false,
            children: { ModerationTools: {} }
          }
        },
        {
          Guard: {
            permissions: ['read', 'write', 'admin'],
            requireAll: true,  // Need ALL permissions
            children: { SuperAdminPanel: {} },
            fallback: { InsufficientPermissions: {} }
          }
        }
      ]
    }
  })
});

// Custom permission logic
const CustomGuard = (props, { getState }) => ({
  render: () => ({
    Guard: {
      permissions: () => {
        const user = getState('auth.user');
        const isOwner = user && user.id === props.resourceOwnerId;
        const hasPermission = getState('auth.permissions', []).includes('admin');
        return isOwner || hasPermission;
      },
      children: { ProtectedResource: props },
      fallback: { AccessDenied: { resource: props.resourceType } }
    }
  })
});
```

## 7. Suspense Component

Handles loading states and errors during async operations. Shows loading UI while waiting and error UI when things fail.

#### ✅ When to Use

Data loading, API calls, async operations, loading screens.

#### 🔧 Key Features

Loading states, error handling, nested boundaries, retry logic.

**Suspense Component Usage**

```javascript
// 7. Suspense Component - Handle Loading States and Errors
const DataLoader = (props, { getState, setState }) => ({
  hooks: {
    onMount: async () => {
      setState('suspense.loading', true);
      setState('suspense.error', null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        const data = { users: ['Alice', 'Bob', 'Charlie'] };
        setState('data.users', data.users);
      } catch (error) {
        setState('suspense.error', error.message);
      } finally {
        setState('suspense.loading', false);
      }
    }
  },
  
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Reload Data',
            onclick: () => {
              setState('suspense.loading', true);
              setState('suspense.error', null);
              
              // Simulate random success/failure
              setTimeout(() => {
                if (Math.random() > 0.7) {
                  setState('suspense.error', 'Network timeout');
                } else {
                  setState('data.users', ['Alice', 'Bob', 'Charlie', 'David']);
                }
                setState('suspense.loading', false);
              }, 1500);
            }
          }
        },
        {
          Suspense: {
            loading: {
              div: {
                className: 'loading-state',
                children: [
                  { div: { className: 'spinner' } },
                  { p: { text: 'Loading user data...' } }
                ]
              }
            },
            error: (error) => ({
              div: {
                className: 'error-state',
                children: [
                  { h3: { text: '❌ Error Loading Data' } },
                  { p: { text: `Error: ${error}` } },
                  {
                    button: {
                      text: 'Retry',
                      onclick: () => {
                        setState('suspense.loading', true);
                        setState('suspense.error', null);
                      }
                    }
                  }
                ]
              }
            }),
            children: {
              div: {
                children: [
                  { h3: { text: 'User Data Loaded Successfully!' } },
                  {
                    For: {
                      items: 'data.users',
                      render: (user) => ({
                        div: { className: 'user-item', text: user }
                      })
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    }
  })
});

// Nested suspense boundaries
const NestedSuspense = () => ({
  render: () => ({
    Suspense: {
      loading: { div: { text: 'Loading app...' } },
      children: {
        div: {
          children: [
            { Header: {} },
            {
              Suspense: {
                loading: { div: { text: 'Loading content...' } },
                error: (error) => ({ ErrorDisplay: { error } }),
                children: { MainContent: {} }
              }
            },
            { Footer: {} }
          ]
        }
      }
    }
  })
});
```

## 8. ErrorBoundary Component

Catches JavaScript errors anywhere in the component tree and displays fallback UI instead of crashing the entire app.

#### ✅ When to Use

Component isolation, error recovery, app stability, debugging.

#### 🔧 Key Features

Error catching, fallback UI, multiple boundaries, retry mechanisms.

**ErrorBoundary Component Usage**

```javascript
// 8. ErrorBoundary Component - Catch and Handle Errors
const ErrorProneComponent = (props, { setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Trigger Error',
            onclick: () => {
              // Simulate an error
              setState('errorBoundary.error', new Error('Something went wrong!'));
            }
          }
        },
        {
          button: {
            text: 'Clear Error',
            onclick: () => setState('errorBoundary.error', null)
          }
        },
        {
          ErrorBoundary: {
            fallback: (error) => ({
              div: {
                className: 'error-boundary',
                children: [
                  { h3: { text: '💥 Component Error' } },
                  { p: { text: `Error: ${error.message}` } },
                  { p: { text: 'The component has crashed but the app continues running.' } },
                  {
                    button: {
                      text: 'Reset Component',
                      onclick: () => setState('errorBoundary.error', null)
                    }
                  }
                ]
              }
            }),
            children: {
              div: {
                className: 'working-component',
                children: [
                  { h3: { text: '✅ Working Component' } },
                  { p: { text: 'This component is working normally.' } },
                  { RiskyOperation: {} }
                ]
              }
            }
          }
        }
      ]
    }
  })
});

// Multiple error boundaries
const AppWithErrorBoundaries = () => ({
  render: () => ({
    div: {
      children: [
        {
          ErrorBoundary: {
            fallback: (error) => ({ HeaderError: { error } }),
            children: { Header: {} }
          }
        },
        {
          ErrorBoundary: {
            fallback: (error) => ({ SidebarError: { error } }),
            children: { Sidebar: {} }
          }
        },
        {
          ErrorBoundary: {
            fallback: (error) => ({ MainContentError: { error } }),
            children: { MainContent: {} }
          }
        }
      ]
    }
  })
});

// Error boundary with retry logic
const RetryableErrorBoundary = (props, { getState, setState }) => ({
  render: () => ({
    ErrorBoundary: {
      fallback: (error) => ({
        div: {
          className: 'retryable-error',
          children: [
            { h3: { text: 'Component Failed' } },
            { p: { text: error.message } },
            {
              p: {
                text: () => {
                  const attempts = getState('error.retryAttempts', 0);
                  return `Retry attempts: ${attempts}`;
                }
              }
            },
            {
              button: {
                text: 'Retry',
                onclick: () => {
                  const attempts = getState('error.retryAttempts', 0);
                  setState('error.retryAttempts', attempts + 1);
                  setState('errorBoundary.error', null);
                }
              }
            }
          ]
        }
      }),
      children: props.children
    }
  })
});
```

## 9. Show Component

Controls visibility with CSS display property. Unlike Conditional, components stay mounted but are hidden/shown.

#### ✅ When to Use

Toggle visibility, maintain state, expensive components, animations.

#### 🔧 Key Features

CSS display control, keeps components mounted, function conditions.

**Show Component Usage**

```javascript
// 9. Show Component - CSS Display Control
const VisibilityDemo = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: () => getState('ui.showContent') ? 'Hide Content' : 'Show Content',
            onclick: () => {
              const current = getState('ui.showContent', false);
              setState('ui.showContent', !current);
            }
          }
        },
        {
          Show: {
            when: 'ui.showContent',  // State path or function
            children: {
              div: {
                className: 'revealable-content',
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  animation: 'fadeIn 0.3s ease'
                },
                children: [
                  { h3: { text: '👁️ Now You See Me!' } },
                  { p: { text: 'This content appears and disappears with CSS display control.' } },
                  { p: { text: 'Unlike Conditional, the component stays mounted in DOM.' } }
                ]
              }
            }
          }
        },
        {
          p: {
            style: { marginTop: '15px', textAlign: 'center' },
            children: [
              { strong: { text: 'Status: ' } },
              {
                span: {
                  style: () => ({
                    color: getState('ui.showContent') ? '#38a169' : '#e53e3e'
                  }),
                  text: () => getState('ui.showContent')
                    ? 'Content visible (display: block)'
                    : 'Content hidden (display: none)'
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// Function-based visibility
const DynamicVisibility = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        {
          Show: {
            when: () => {
              const user = getState('auth.user');
              const time = new Date().getHours();
              return user && (time >= 9 && time <= 17); // Business hours
            },
            children: { BusinessHoursContent: {} }
          }
        },
        {
          Show: {
            when: () => getState('user.preferences.showAdvanced', false),
            children: { AdvancedSettings: {} }
          }
        }
      ]
    }
  })
});

// Show vs Conditional Comparison
// Show: Uses CSS display, component stays mounted
// Conditional: Completely mounts/unmounts component

const ShowVsConditional = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        {
          h4: { text: 'Show Component (stays mounted):' }
        },
        {
          Show: {
            when: 'demo.visible',
            children: { ExpensiveComponent: {} }  // Stays in DOM when hidden
          }
        },
        {
          h4: { text: 'Conditional Component (mounts/unmounts):' }
        },
        {
          Conditional: {
            condition: 'demo.visible',
            then: { ExpensiveComponent: {} }  // Completely removed from DOM when hidden
          }
        }
      ]
    }
  })
});
```

## 10. Match Component

Advanced pattern matching with multiple function-based conditions. More flexible than Switch for complex scenarios.

#### ✅ When to Use

Complex conditions, pattern matching, multiple criteria, advanced logic.

#### 🔧 Key Features

Function conditions, ordered evaluation, default fallback, flexible patterns.

**Match Component Usage**

```javascript
// 10. Match Component - Pattern Matching with Multiple Conditions
const StatusMatcher = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            className: 'status-controls',
            children: [
              {
                button: {
                  text: 'Loading',
                  onclick: () => {
                    setState('api.loading', true);
                    setState('api.error', null);
                    setState('api.data', null);
                  }
                }
              },
              {
                button: {
                  text: 'Success',
                  onclick: () => {
                    setState('api.loading', false);
                    setState('api.error', null);
                    setState('api.data', { users: ['Alice', 'Bob'] });
                  }
                }
              },
              {
                button: {
                  text: 'Error',
                  onclick: () => {
                    setState('api.loading', false);
                    setState('api.error', 'Network timeout');
                    setState('api.data', null);
                  }
                }
              }
            ]
          }
        },
        {
          Match: {
            cases: [
              {
                when: 'api.loading',
                render: {
                  div: {
                    className: 'loading-state',
                    children: [
                      { div: { className: 'spinner' } },
                      { p: { text: 'Loading data...' } }
                    ]
                  }
                }
              },
              {
                when: 'api.error',
                render: {
                  div: {
                    className: 'error-state',
                    children: [
                      { h3: { text: '❌ Error' } },
                      { p: { text: () => `Error: ${getState('api.error')}` } }
                    ]
                  }
                }
              },
              {
                when: 'api.data',
                render: {
                  div: {
                    className: 'success-state',
                    children: [
                      { h3: { text: '✅ Data Loaded' } },
                      { p: { text: () => `Found ${getState('api.data.users', []).length} users` } }
                    ]
                  }
                }
              }
            ],
            default: {
              div: {
                className: 'idle-state',
                text: '⏳ Waiting for action...'
              }
            }
          }
        }
      ]
    }
  })
});

// Complex pattern matching with functions
const AdvancedMatcher = (props, { getState }) => ({
  render: () => ({
    Match: {
      cases: [
        {
          when: () => {
            const user = getState('auth.user');
            return user && user.role === 'admin';
          },
          render: { AdminInterface: {} }
        },
        {
          when: () => {
            const user = getState('auth.user');
            const subscription = getState('user.subscription');
            return user && subscription && subscription.plan === 'premium';
          },
          render: { PremiumInterface: {} }
        },
        {
          when: () => getState('auth.user') !== null,
          render: { StandardInterface: {} }
        }
      ],
      default: { LoginInterface: {} }
    }
  })
});

// Nested matching
const NestedMatcher = (props, { getState }) => ({
  render: () => ({
    Match: {
      cases: [
        {
          when: 'user.isLoggedIn',
          render: {
            Match: {
              cases: [
                {
                  when: () => getState('user.profile.isComplete'),
                  render: { Dashboard: {} }
                },
                {
                  when: () => !getState('user.profile.isComplete'),
                  render: { ProfileSetup: {} }
                }
              ]
            }
          }
        }
      ],
      default: { LoginForm: {} }
    }
  })
});
```

## 11. Repeat Component

Generates a specific number of elements. Perfect for stars, ratings, pagination, or any count-based rendering.

#### ✅ When to Use

Star ratings, pagination dots, progress bars, grid layouts.

#### 🔧 Key Features

Count-based rendering, index access, dynamic counts, custom patterns.

**Repeat Component Usage**

```javascript
// 11. Repeat Component - Generate Elements by Count
const StarRating = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            className: 'rating-controls',
            children: [
              {
                input: {
                  type: 'range',
                  min: '0',
                  max: '5',
                  value: () => getState('demo.rating', 3),
                  oninput: (e) => setState('demo.rating', parseInt(e.target.value))
                }
              },
              {
                span: {
                  text: () => ` Rating: ${getState('demo.rating', 3)}/5`
                }
              }
            ]
          }
        },
        {
          div: {
            className: 'star-display',
            children: [
              {
                Repeat: {
                  times: 5,  // Fixed number
                  render: (index) => ({
                    span: {
                      className: () => {
                        const rating = getState('demo.rating', 3);
                        return index < rating ? 'star filled' : 'star empty';
                      },
                      text: '★',
                      style: {
                        fontSize: '2rem',
                        color: () => {
                          const rating = getState('demo.rating', 3);
                          return index < rating ? '#ffd700' : '#e2e8f0';
                        },
                        cursor: 'pointer'
                      },
                      onclick: () => setState('demo.rating', index + 1)
                    }
                  })
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// Dynamic repeat count
const DynamicDots = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            children: [
              {
                button: {
                  text: '+',
                  onclick: () => {
                    const current = getState('ui.dotCount', 3);
                    setState('ui.dotCount', Math.min(current + 1, 10));
                  }
                }
              },
              {
                span: {
                  text: () => ` Dots: ${getState('ui.dotCount', 3)} `,
                  style: { margin: '0 10px' }
                }
              },
              {
                button: {
                  text: '-',
                  onclick: () => {
                    const current = getState('ui.dotCount', 3);
                    setState('ui.dotCount', Math.max(current - 1, 0));
                  }
                }
              }
            ]
          }
        },
        {
          div: {
            style: { marginTop: '20px' },
            children: [
              {
                Repeat: {
                  times: () => getState('ui.dotCount', 3),  // Dynamic count
                  render: (index) => ({
                    div: {
                      style: {
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                        display: 'inline-block',
                        margin: '5px',
                        animation: `pulse ${1 + index * 0.2}s infinite`
                      }
                    }
                  })
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// Complex repeat patterns
const ProgressBar = (props, { getState }) => ({
  render: () => ({
    div: {
      className: 'progress-container',
      children: [
        {
          Repeat: {
            times: 10,
            render: (index) => ({
              div: {
                className: 'progress-segment',
                style: () => {
                  const progress = getState('ui.progress', 0);
                  const isActive = (index + 1) * 10 <= progress;
                  return {
                    width: '30px',
                    height: '20px',
                    backgroundColor: isActive ? '#4ade80' : '#e5e7eb',
                    display: 'inline-block',
                    margin: '2px',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s ease'
                  };
                }
              }
            })
          }
        }
      ]
    }
  })
});
```

## 12. Await Component

Handles Promise-based async operations with loading, success, and error states. Perfect for API calls and async data loading.

#### ✅ When to Use

API calls, async data loading, promise handling, async operations.

#### 🔧 Key Features

Promise handling, loading/error/success states, data passing.

**Await Component Usage**

```javascript
// 12. Await Component - Handle Promise-Based Operations
const AsyncDataLoader = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          button: {
            text: 'Load Data',
            onclick: () => {
              // Trigger a new promise
              const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                  if (Math.random() > 0.3) {
                    resolve({ users: ['Alice', 'Bob', 'Charlie'], timestamp: Date.now() });
                  } else {
                    reject(new Error('Failed to load data'));
                  }
                }, 2000);
              });
              
              setState('async.promise', promise);
            }
          }
        },
        {
          Await: {
            promise: () => getState('async.promise'),  // Promise from state
            loading: {
              div: {
                className: 'loading-async',
                children: [
                  { div: { className: 'spinner' } },
                  { p: { text: 'Loading async data...' } },
                  { p: { text: 'This may take a few seconds.' } }
                ]
              }
            },
            then: (data) => ({
              div: {
                className: 'async-success',
                children: [
                  { h3: { text: '✅ Data Loaded Successfully!' } },
                  { p: { text: `Loaded at: ${new Date(data.timestamp).toLocaleTimeString()}` } },
                  {
                    ul: {
                      children: data.users.map(user => ({
                        li: { text: user }
                      }))
                    }
                  }
                ]
              }
            }),
            error: (error) => ({
              div: {
                className: 'async-error',
                children: [
                  { h3: { text: '❌ Loading Failed' } },
                  { p: { text: `Error: ${error.message}` } },
                  {
                    button: {
                      text: 'Try Again',
                      onclick: () => setState('async.promise', null)
                    }
                  }
                ]
              }
            })
          }
        }
      ]
    }
  })
});

// Function-based promises
const DynamicAwait = (props, { getState }) => ({
  render: () => ({
    Await: {
      promise: () => {
        const userId = getState('user.selectedId');
        if (!userId) return null;
        
        return fetch(`/api/users/${userId}`)
          .then(response => response.json());
      },
      loading: { UserSkeleton: {} },
      then: (userData) => ({ UserProfile: { user: userData } }),
      error: (error) => ({ UserError: { error } })
    }
  })
});

// Chained async operations
const ChainedOperations = (props, context) => ({
  render: () => ({
    Await: {
      promise: () => {
        return fetch('/api/auth/token')
          .then(response => response.json())
          .then(tokenData => {
            return fetch('/api/user/profile', {
              headers: { Authorization: `Bearer ${tokenData.token}` }
            });
          })
          .then(response => response.json());
      },
      loading: { div: { text: 'Authenticating and loading profile...' } },
      then: (profile) => ({ UserDashboard: { profile } }),
      error: (error) => ({ AuthError: { error } })
    }
  })
});

// Multiple concurrent operations
const ConcurrentAwait = (props, context) => ({
  render: () => ({
    div: {
      children: [
        {
          Await: {
            promise: () => Promise.all([
              fetch('/api/users').then(r => r.json()),
              fetch('/api/posts').then(r => r.json()),
              fetch('/api/comments').then(r => r.json())
            ]),
            loading: { div: { text: 'Loading all data...' } },
            then: ([users, posts, comments]) => ({
              div: {
                children: [
                  { UsersList: { users } },
                  { PostsList: { posts } },
                  { CommentsList: { comments } }
                ]
              }
            }),
            error: (error) => ({ LoadingError: { error } })
          }
        }
      ]
    }
  })
});
```

## 13. Dynamic Component

Loads and renders components dynamically by name. Essential for plugin systems, routing, and widget management.

#### ✅ When to Use

Widget systems, routing, plugin architecture, dynamic loading.

#### 🔧 Key Features

Component name resolution, prop passing, fallback content, lazy loading.

**Dynamic Component Usage**

```javascript
// 13. Dynamic Component - Load Components by Name
const DynamicWidgetLoader = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          div: {
            className: 'widget-selector',
            children: [
              {
                button: {
                  text: 'Chart Widget',
                  onclick: () => setState('ui.currentWidget', 'ChartWidget')
                }
              },
              {
                button: {
                  text: 'Calendar Widget', 
                  onclick: () => setState('ui.currentWidget', 'CalendarWidget')
                }
              },
              {
                button: {
                  text: 'Todo Widget',
                  onclick: () => setState('ui.currentWidget', 'TodoWidget')
                }
              },
              {
                button: {
                  text: 'Clear Widget',
                  onclick: () => setState('ui.currentWidget', null)
                }
              }
            ]
          }
        },
        {
          div: {
            className: 'widget-container',
            children: [
              {
                Dynamic: {
                  component: 'ui.currentWidget',  // State path to component name
                  props: {
                    title: 'Dynamic Widget',
                    data: () => getState('widgets.data')
                  },
                  fallback: {
                    div: {
                      className: 'no-widget',
                      style: {
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                        border: '2px dashed #ccc',
                        borderRadius: '10px'
                      },
                      children: [
                        { h3: { text: '🎯 Dynamic Component Loader' } },
                        { p: { text: 'Select a widget above to load it dynamically!' } },
                        { p: { text: 'Components are loaded and instantiated at runtime.' } }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// Function-based component selection
const ConditionalDynamic = (props, { getState }) => ({
  render: () => ({
    Dynamic: {
      component: () => {
        const userRole = getState('auth.role');
        const isOnline = getState('user.isOnline');
        
        if (userRole === 'admin') return 'AdminDashboard';
        if (userRole === 'user' && isOnline) return 'UserDashboard';
        if (userRole === 'user' && !isOnline) return 'OfflineMode';
        return 'GuestView';
      },
      props: {
        userId: () => getState('auth.userId'),
        permissions: () => getState('auth.permissions')
      }
    }
  })
});

// Route-based dynamic components
const Router = (props, { getState }) => ({
  render: () => ({
    Dynamic: {
      component: () => {
        const route = getState('router.currentRoute', '/');
        const routeMap = {
          '/': 'HomePage',
          '/about': 'AboutPage',
          '/contact': 'ContactPage',
          '/dashboard': 'DashboardPage',
          '/profile': 'ProfilePage'
        };
        return routeMap[route] || 'NotFoundPage';
      },
      props: {
        route: () => getState('router.currentRoute'),
        params: () => getState('router.params')
      },
      fallback: {
        div: {
          text: 'Loading page...',
          style: { textAlign: 'center', padding: '50px' }
        }
      }
    }
  })
});

// Plugin system with dynamic components
const PluginManager = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        {
          For: {
            items: 'plugins.enabled',
            render: (plugin) => ({
              div: {
                className: 'plugin-container',
                children: [
                  { h4: { text: plugin.name } },
                  {
                    Dynamic: {
                      component: plugin.componentName,
                      props: plugin.config,
                      fallback: {
                        div: {
                          text: `Plugin "${plugin.name}" failed to load`,
                          className: 'plugin-error'
                        }
                      }
                    }
                  }
                ]
              }
            })
          }
        }
      ]
    }
  })
});

// Widget system with lazy loading
const LazyWidgetLoader = (props, { getState, setState }) => ({
  render: () => ({
    Dynamic: {
      component: () => {
        const widgetName = getState('ui.selectedWidget');
        
        // Simulate lazy loading
        if (widgetName && !getState(`widgets.loaded.${widgetName}`)) {
          setState(`widgets.loaded.${widgetName}`, true);
          console.log(`Lazy loading widget: ${widgetName}`);
        }
        
        return widgetName;
      },
      props: {
        isLazyLoaded: true,
        loadedAt: () => Date.now()
      }
    }
  })
});
```

## Performance Optimization

Control flow components include several performance optimizations to ensure smooth rendering and minimal re-computation.

**Performance Patterns**

```javascript
// Performance Optimization Patterns for Control Components

// 1. For Component Optimization with "ignore"
const OptimizedList = (props, { getState, setState }) => ({
  render: () => ({
    For: {
      items: 'users.list',
      render: (user, index) => ({
        div: {
          className: 'user-item',
          children: [
            { span: { text: user.name } },
            { span: { text: user.email } }
          ]
        }
      }),
      keyPath: 'id',  // Stable keys for performance
      // When array length doesn't change, For returns "ignore"
      // This preserves DOM structure and avoids re-rendering
    }
  })
});

// 2. Conditional vs Show Performance
const PerformanceComparison = (props, { getState }) => ({
  render: () => ({
    div: {
      children: [
        // Use Conditional for expensive components that should unmount
        {
          Conditional: {
            condition: 'ui.showExpensiveComponent',
            then: { ExpensiveDataVisualization: {} }  // Unmounts when hidden
          }
        },
        
        // Use Show for components that should stay mounted
        {
          Show: {
            when: 'ui.showCachedComponent',
            children: { CachedUserProfile: {} }  // Stays mounted, just hidden
          }
        }
      ]
    }
  })
});

// 3. Memoized Dynamic Components
const MemoizedDynamic = (props, { getState, setState }) => ({
  render: () => ({
    Dynamic: {
      component: () => {
        const componentName = getState('ui.component');
        const lastComponent = getState('ui.lastComponent');
        
        // Only update if component actually changed
        if (componentName !== lastComponent) {
          setState('ui.lastComponent', componentName);
        }
        
        return componentName;
      },
      props: {
        // Pass stable props to avoid unnecessary re-renders
        staticData: props.staticData,
        dynamicData: () => getState('component.data')
      }
    }
  })
});

// 4. Efficient State Management
const EfficientStateUpdates = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        {
          For: {
            items: 'todos.list',
            render: (todo, index) => ({
              div: {
                children: [
                  {
                    input: {
                      type: 'checkbox',
                      checked: todo.completed,
                      onchange: (e) => {
                        // Update individual item instead of entire array
                        setState(`todos.list.${index}.completed`, e.target.checked);
                      }
                    }
                  },
                  { span: { text: todo.text } }
                ]
              }
            })
          }
        }
      ]
    }
  })
});
```

## Best Practices

Follow these patterns for optimal performance, maintainability, and user experience when using control flow components.

**Best Practice Patterns**

```javascript
// Best Practices for Control Flow Components

// 1. Choose the Right Component
const ComponentSelection = () => ({
  render: () => ({
    div: {
      children: [
        // Use Conditional for mount/unmount behavior
        {
          Conditional: {
            condition: 'user.hasSubscription',
            then: { PremiumFeatures: {} },      // Unmounted when condition false
            else: { SubscriptionPrompt: {} }
          }
        },
        
        // Use Show for visibility toggle (stays mounted)
        {
          Show: {
            when: 'ui.showDetails',
            children: { UserDetails: {} }       // Hidden but stays in DOM
          }
        },
        
        // Use Switch for multiple exclusive states
        {
          Switch: {
            value: 'app.state',
            cases: {
              'loading': { LoadingScreen: {} },
              'error': { ErrorScreen: {} },
              'success': { MainContent: {} }
            }
          }
        },
        
        // Use Match for complex pattern matching
        {
          Match: {
            cases: [
              { when: () => complexCondition1(), render: { Component1: {} } },
              { when: () => complexCondition2(), render: { Component2: {} } }
            ],
            default: { DefaultComponent: {} }
          }
        }
      ]
    }
  })
});

// 2. State Organization
const WellOrganizedState = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        // Organize state by domain
        {
          Guard: {
            permissions: () => getState('auth.permissions', []),
            children: { ProtectedContent: {} }
          }
        },
        {
          For: {
            items: 'data.users.list',      // Clear hierarchy
            loading: 'data.users.loading',
            render: (user) => ({ UserCard: { user } })
          }
        }
      ]
    }
  })
});

// 3. Error Handling Strategy
const RobustErrorHandling = () => ({
  render: () => ({
    ErrorBoundary: {
      fallback: (error) => ({ AppError: { error } }),
      children: {
        div: {
          children: [
            {
              ErrorBoundary: {
                fallback: (error) => ({ SidebarError: { error } }),
                children: { Sidebar: {} }
              }
            },
            {
              ErrorBoundary: {
                fallback: (error) => ({ ContentError: { error } }),
                children: {
                  Suspense: {
                    loading: { ContentSkeleton: {} },
                    error: (error) => ({ ContentLoadError: { error } }),
                    children: { MainContent: {} }
                  }
                }
              }
            }
          ]
        }
      }
    }
  })
});

// 4. Composition Patterns
const ComposedComponents = () => ({
  render: () => ({
    div: {
      children: [
        // Nest components logically
        {
          Guard: {
            permissions: ['read'],
            children: {
              Suspense: {
                loading: { DataSkeleton: {} },
                children: {
                  Conditional: {
                    condition: 'data.hasItems',
                    then: {
                      For: {
                        items: 'data.items',
                        render: (item) => ({ DataItem: { item } })
                      }
                    },
                    else: { EmptyState: {} }
                  }
                }
              }
            },
            fallback: { AccessDenied: {} }
          }
        }
      ]
    }
  })
});

// 5. Avoid Common Pitfalls
const AvoidPitfalls = (props, { getState, setState }) => ({
  render: () => ({
    div: {
      children: [
        // ❌ Don't do this - creates new array every render
        // {
        //   For: {
        //     items: () => getState('data.items', []).filter(item => item.active),
        //     render: (item) => ({ Item: { item } })
        //   }
        // },
        
        // ✅ Do this - compute filtered items in state
        {
          For: {
            items: 'data.filteredItems',  // Pre-computed in state
            render: (item) => ({ Item: { item } })
          }
        },
        
        // ❌ Don't nest too deeply
        // {
        //   Conditional: {
        //     condition: 'a',
        //     then: {
        //       Conditional: {
        //         condition: 'b',
        //         then: {
        //           Conditional: {
        //             condition: 'c',
        //             then: { Component: {} }
        //           }
        //         }
        //       }
        //     }
        //   }
        // },
        
        // ✅ Use Match or compute condition
        {
          Match: {
            cases: [
              {
                when: () => getState('a') && getState('b') && getState('c'),
                render: { Component: {} }
              }
            ]
          }
        }
      ]
    }
  })
});
```

## Component Comparison Guide

#### 🔀 Conditional vs Show

Conditional: Mount/unmount behavior, better for expensive components

Show: CSS display control, preserves state and DOM position

#### 🔄 Switch vs Match

Switch: Simple value-based switching, clean syntax

Match: Complex pattern matching, function-based conditions

#### ⚡ Await vs Suspense

Await: Promise-specific, handles single async operations

Suspense: General loading states, can handle multiple sources

#### 🔄 For vs Repeat

For: Array iteration, data-driven rendering

Repeat: Count-based rendering, number-driven generation

#### 🛡️ Guard vs Conditional

Guard: Permission-specific, reads from auth.permissions

Conditional: General purpose, any state or condition

#### 🎯 Portal vs Fragment

Portal: Renders outside parent DOM tree

Fragment: Groups children without wrapper in same tree

## Control Flow Components Summary

**Juris control flow components provide a complete toolkit for managing conditional rendering, iteration, async operations, and component composition. Each component is optimized for specific use cases while maintaining consistent APIs and performance characteristics. Choose the right component for your scenario to build robust, maintainable applications.**