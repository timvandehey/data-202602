# **Components**

Master Juris component patterns: from basic structure to advanced composition and optimization techniques.

## Component Structure

Every Juris component follows a consistent structure with optional hooks, API, and required render function.

**Basic Component Structure**

```javascript
const MyComponent = (props, context) => {
  return {
    hooks: {
      onMount: () => console.log('Component mounted'),
      onUnmount: () => console.log('Component unmounted')
    },
    
    render: () => ({
      div: {
        className: 'my-component',
        text: `Hello ${props.name || 'World'}`
      }
    })
  };
};
```

## Object DOM Structure

Components are composed using Object DOM syntax, allowing for clean nesting and composition.

**Component Usage in Object DOM**

```javascript
div: {
  children: [
    { ComponentA: { staticProps: 'value', reactiveProps: () => getState('path') } },
    { ComponentB: { reactiveObjectDOM: () => ({ span: { text: getState('data') } }) } },
    {
      div: {
        children: [
          { ComponentC: { nested: true } },
          { ComponentD: { composition: 'works' } }
        ]
      }
    }
  ]
}
```

## Reactive Props

Props can be static values or reactive functions. Reactive props automatically update when their dependencies change.

**Static vs Reactive Props**

```javascript
// Static vs Reactive Props
const UserCard = (props, context) => ({
  render: () => ({
    div: {
      className: 'user-card',
      children: [
        {
          // Static prop - won't change
          h3: { text: props.title }
        },
        {
          // Reactive prop - updates automatically
          p: { 
            text: () => {
              const userId = typeof props.userId === 'function' 
                ? props.userId() 
                : props.userId;
              return getState(`users.${userId}.name`, 'Loading...');
            }
          }
        }
      ]
    }
  })
});

// Usage with reactive props:
{
  UserCard: {
    title: 'User Profile',                    // Static
    userId: () => getState('ui.selectedUser') // Reactive
  }
}
```

## DOM Objects as Props

Juris's revolutionary feature: pass entire DOM structures as props for ultimate composition flexibility.

**Advanced Component Composition**

```javascript
// DOM Objects as Props - Ultimate Composition
const Modal = (props, context) => ({
  render: () => ({
    div: {
      className: 'modal-overlay',
      children: [
        {
          div: {
            className: 'modal-content',
            children: [
              // Header can be any DOM structure
              props.header || { h2: { text: 'Default Title' } },
              
              // Body accepts arrays of DOM objects
              {
                div: {
                  className: 'modal-body',
                  children: Array.isArray(props.body) ? props.body : [props.body]
                }
              },
              
              // Footer with conditional content
              props.footer || {
                div: {
                  className: 'modal-footer',
                  children: [
                    {
                      button: {
                        text: 'Close',
                        onclick: () => setState('modal.isOpen', false)
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  })
});

// Usage with complex DOM object props:
{
  Modal: {
    header: {
      div: {
        className: 'custom-header',
        children: [
          { h2: { text: 'User Settings' } },
          { span: { text: () => `Logged in as ${getState('user.name')}` } }
        ]
      }
    },
    body: [
      { UserProfile: {} },
      { AccountSettings: {} },
      props.showAdvanced ? { AdvancedOptions: {} } : null
    ].filter(Boolean),
    footer: () => {
      const hasChanges = getState('form.hasChanges');
      return {
        div: {
          className: 'modal-actions',
          children: hasChanges ? [
            { button: { text: 'Save', onclick: () => saveChanges() } },
            { button: { text: 'Cancel', onclick: () => cancelChanges() } }
          ] : [
            { button: { text: 'Close', onclick: () => closeModal() } }
          ]
        }
      };
    }
  }
}
```

## Component Lifecycle

Lifecycle hooks provide clean setup and teardown patterns without the complexity of useEffect.

**Lifecycle Hooks**

```javascript
// Component Lifecycle Hooks
const DataComponent = (props, context) => {
  const { getState, setState, subscribe } = context;
  let unsubscribe = null;

  return {
    hooks: {
      onMount: () => {
        console.log('Component mounted, setting up subscriptions');
        
        // Subscribe to external data changes
        unsubscribe = subscribe('api.data', (newData) => {
          console.log('External data changed:', newData);
        });
        
        // Initialize component data
        if (!getState('component.initialized')) {
          setState('component.initialized', true);
          loadInitialData();
        }
      },

      onUpdate: (oldProps, newProps) => {
        console.log('Props changed:', { oldProps, newProps });
        
        // React to prop changes
        if (oldProps.userId !== newProps.userId) {
          loadUserData(newProps.userId);
        }
      },

      onUnmount: () => {
        console.log('Component unmounting, cleaning up');
        
        // Clean up subscriptions
        if (unsubscribe) {
          unsubscribe();
        }
        
        // Clear component state if needed
        setState('component.tempData', null);
      }
    },

    render: () => ({
      div: {
        className: 'data-component',
        text: () => {
          const data = getState('component.data');
          const loading = getState('component.loading', false);
          
          if (loading) return 'Loading...';
          if (!data) return 'No data';
          return `Data: ${data.title}`;
        }
      }
    })
  };

  function loadInitialData() {
    setState('component.loading', true);
    // Simulate API call
    setTimeout(() => {
      setState('component.data', { title: 'Initial Data' });
      setState('component.loading', false);
    }, 1000);
  }

  function loadUserData(userId) {
    setState('component.loading', true);
    // Load user-specific data
    setTimeout(() => {
      setState('component.data', { title: `User ${userId} Data` });
      setState('component.loading', false);
    }, 500);
  }
};
```

## Conditional Rendering

Handle conditional rendering with reactive children functions that return different component structures based on state.

**Conditional Rendering Patterns**

```javascript
// Conditional Rendering Patterns
const ConditionalDisplay = (props, context) => ({
  render: () => ({
    div: {
      className: 'conditional-display',
      children: () => {
        const user = getState('auth.user');
        const isLoading = getState('auth.loading', false);
        const error = getState('auth.error');

        // Early returns for different states
        if (isLoading) {
          return [{ div: { className: 'loading', text: 'Loading...' } }];
        }

        if (error) {
          return [
            {
              div: {
                className: 'error-message',
                children: [
                  { h3: { text: 'Error' } },
                  { p: { text: error.message } },
                  {
                    button: {
                      text: 'Retry',
                      onclick: () => setState('auth.error', null)
                    }
                  }
                ]
              }
            }
          ];
        }

        if (!user) {
          return [{ LoginForm: {} }];
        }

        // Logged in user UI
        return [
          { UserDashboard: {} },
          user.isAdmin ? { AdminPanel: {} } : null,
          {
            div: {
              className: 'user-actions',
              children: [
                { NotificationPanel: {} },
                user.hasMessages ? { MessageCenter: {} } : null
              ].filter(Boolean)
            }
          }
        ].filter(Boolean);
      }
    }
  })
});

// Alternative: Multiple condition checks
const MultiConditionComponent = (props, context) => ({
  render: () => ({
    div: {
      className: 'multi-condition',
      children: () => {
        const conditions = {
          hasUser: getState('auth.user'),
          isAdmin: getState('auth.user.isAdmin', false),
          hasNotifications: getState('notifications.count', 0) > 0,
          isDarkMode: getState('ui.theme') === 'dark'
        };

        const components = [];

        // Add components based on conditions
        if (conditions.hasUser) {
          components.push({ UserProfile: {} });
          
          if (conditions.isAdmin) {
            components.push({ AdminControls: {} });
          }
          
          if (conditions.hasNotifications) {
            components.push({ NotificationBadge: {} });
          }
        } else {
          components.push({ LoginPrompt: {} });
        }

        // Add theme-specific component
        components.push({
          div: {
            className: conditions.isDarkMode ? 'dark-theme' : 'light-theme',
            text: 'Theme applied'
          }
        });

        return components;
      }
    }
  })
});
```

## Advanced Composition

Build highly flexible components that accept complex content structures and adapt to different use cases.

**Flexible Component Design**

```javascript
// Advanced Component Composition
const FlexibleCard = (props, context) => ({
  render: () => ({
    div: {
      className: () => `card ${getState('ui.cardTheme', 'default')}`,
      children: [
        // Conditional header
        props.title && {
          div: {
            className: 'card-header',
            children: Array.isArray(props.title) ? props.title : [props.title]
          }
        },
        
        // Main content area
        {
          div: {
            className: 'card-content',
            children: () => {
              // Content can be reactive function returning DOM objects
              const content = typeof props.content === 'function' 
                ? props.content() 
                : props.content;
              return Array.isArray(content) ? content : [content];
            }
          }
        },
        
        // Optional sidebar
        props.sidebar && {
          div: {
            className: 'card-sidebar',
            children: Array.isArray(props.sidebar) ? props.sidebar : [props.sidebar]
          }
        },
        
        // Actions footer
        props.actions && {
          div: {
            className: 'card-actions',
            children: () => {
              const actions = typeof props.actions === 'function' 
                ? props.actions() 
                : props.actions;
              return Array.isArray(actions) ? actions : [actions];
            }
          }
        }
      ].filter(Boolean)
    }
  })
});

// Usage examples:
{
  FlexibleCard: {
    title: [
      { h3: { text: 'Product Details' } },
      { span: { className: 'badge', text: () => getState('product.status') } }
    ],
    content: () => {
      const product = getState('product.current');
      return [
        { p: { text: product?.description || 'No description' } },
        { div: { text: `Price: $${product?.price || 0}` } },
        product?.image && { img: { src: product.image, alt: product.name } }
      ].filter(Boolean);
    },
    sidebar: [
      { RelatedProducts: {} },
      { CustomerReviews: {} }
    ],
    actions: () => {
      const inStock = getState('product.current.inStock');
      return [
        {
          button: {
            text: 'Add to Cart',
            disabled: !inStock,
            onclick: () => addToCart()
          }
        },
        {
          button: {
            text: 'Wishlist',
            onclick: () => addToWishlist()
          }
        }
      ];
    }
  }
}
```

## Performance Optimization

Optimize large lists and complex UIs with granular reactivity and smart rendering strategies including the use of "ignore" to preserve existing DOM.

**Performance Patterns**

```javascript
// Performance Optimization Patterns
const OptimizedList = (props, context) => {
  const { items = [] } = props;

  return {
    render: () => ({
      div: {
        className: 'optimized-list',
        children: () => {
          const filter = getState('list.filter', '');
          const sortBy = getState('list.sortBy', 'name');
          const currentItems = getState('list.items', items);
          
          // Check if we can skip re-rendering
          const listLength = currentItems.length;
          const previousLength = getState('list.previousLength', 0);
          
          if (listLength === previousLength && 
              !getState('list.filterChanged', false) && 
              !getState('list.sortChanged', false)) {
            return "ignore"; // Preserve existing DOM
          }
          
          // Update tracking state
          setState('list.previousLength', listLength);
          setState('list.filterChanged', false);
          setState('list.sortChanged', false);
          
          // Render items with individual reactivity
          return currentItems
            .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
            .sort((a, b) => a[sortBy]?.localeCompare(b[sortBy]))
            .map(item => ({
              OptimizedListItem: { 
                itemId: item.id, 
                key: item.id 
              }
            }));
        }
      }
    })
  };
};

// Individual items handle their own reactivity
const OptimizedListItem = (props, context) => ({
  render: () => {
    const item = getState(`items.byId.${props.itemId}`);
    
    return {
      div: {
        className: () => {
          const isSelected = getState(`selection.items`, []).includes(props.itemId);
          return isSelected ? 'list-item selected' : 'list-item';
        },
        children: [
          {
            h4: { 
              text: () => getState(`items.byId.${props.itemId}.name`, '') 
            }
          },
          {
            p: { 
              text: () => getState(`items.byId.${props.itemId}.description`, '') 
            }
          },
          {
            button: {
              text: () => {
                const isSelected = getState(`selection.items`, []).includes(props.itemId);
                return isSelected ? 'Deselect' : 'Select';
              },
              onclick: () => {
                const selected = getState('selection.items', []);
                const newSelection = selected.includes(props.itemId)
                  ? selected.filter(id => id !== props.itemId)
                  : [...selected, props.itemId];
                setState('selection.items', newSelection);
              }
            }
          }
        ]
      }
    };
  }
});
```

## Error Handling

Build robust applications with proper error boundaries and graceful error recovery mechanisms.

**Error Boundaries**

```javascript
// Error Boundaries and Error Handling
const ErrorBoundary = (props, context) => ({
  hooks: {
    onMount: () => {
      // Set up global error handler
      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handlePromiseRejection);
    },
    
    onUnmount: () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    }
  },

  render: () => {
    const error = getState('app.error');
    const isRecovering = getState('app.isRecovering', false);

    if (error && !isRecovering) {
      return {
        div: {
          className: 'error-boundary',
          children: [
            { h2: { text: 'Something went wrong' } },
            { p: { text: error.message } },
            {
              details: {
                children: [
                  { summary: { text: 'Error Details' } },
                  { pre: { text: error.stack } }
                ]
              }
            },
            {
              div: {
                className: 'error-actions',
                children: [
                  {
                    button: {
                      text: 'Try Again',
                      onclick: () => {
                        setState('app.isRecovering', true);
                        setTimeout(() => {
                          setState('app.error', null);
                          setState('app.isRecovering', false);
                        }, 500);
                      }
                    }
                  },
                  {
                    button: {
                      text: 'Reload Page',
                      onclick: () => window.location.reload()
                    }
                  }
                ]
              }
            }
          ]
        }
      };
    }

    // Normal rendering with error protection
    try {
      return {
        div: {
          className: 'app-content',
          children: Array.isArray(props.children) ? props.children : [props.children]
        }
      };
    } catch (renderError) {
      setState('app.error', {
        message: renderError.message,
        stack: renderError.stack,
        timestamp: Date.now()
      });
      return { div: { text: 'Loading...' } };
    }
  }

  function handleGlobalError(event) {
    setState('app.error', {
      message: event.error.message,
      stack: event.error.stack,
      timestamp: Date.now(),
      type: 'javascript'
    });
  }

  function handlePromiseRejection(event) {
    setState('app.error', {
      message: event.reason.message || 'Promise rejection',
      stack: event.reason.stack || '',
      timestamp: Date.now(),
      type: 'promise'
    });
  }
});
```

## Key Principles

#### 🎯 Functions = Reactive

Use functions for values that should update automatically when state changes.

#### ⚡ Values = Static

Use direct values for content that never changes during component lifetime.

#### 🔗 State Isolation

Components access shared state directly, eliminating prop drilling and coordination complexity.

#### 🎨 DOM Composition

Pass DOM structures as props for ultimate flexibility and runtime composition.