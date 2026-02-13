# **State Management**

Domain-based global state with automatic reactive dependency tracking.

## What is State Management in Juris?

State Management in Juris = Domain-Based Global State Access. Simply get and set state organized by logical domains. Reactivity happens when you make props/attributes functions that call getState().

#### 🌐 Global State

Accessible from any component, anywhere in the application tree.

#### 🏗️ Domain-Organized

Logical grouping by concern: ui.*, auth.*, data.*, form.*

#### ⚡ Simple Access

Just getState(path) and setState(path, value) - that's it.

## Basic State Usage

**Simple Counter Example**

```javascript
const Counter = (props, context) => {
  const { getState, setState } = context;
  
  return {
    render: () => ({
      div: {
        children: [
          {
            p: {
              text: () => `Count: ${getState('counter', 0)}`
            }
          },
          {
            button: {
              text: 'Increment',
              onclick: () => setState('counter', getState('counter', 0) + 1)
            }
          }
        ]
      }
    })
  };
}
```

## Domain-Based Organization

Organize your global state by logical domains for clarity and maintainability.

**Domain Organization Patterns**

```javascript
// Domain-Based Global State Organization

const Counter = (props, context) => {
    const { getState, setState } = context;
    return {
        render: () => ({
            div: {
                children: [
                    {
                        p: {
                            // If 'demo.counter' doesn't exist, uses 0 as default
                            text: () => `Count: ${getState('demo.counter', 0)}`
                        }
                    },
                    {
                        button: {
                            text: 'Increment',
                            onclick: () => {
                                // Gets current value (or 0 if doesn't exist) and increments
                                const current = getState('demo.counter', 0);
                                setState('demo.counter', current + 1);
                            }
                        }
                    }
                ]
            }
        })
    };
};

const UserProfile = (props, context) => {
    const { getState, setState } = context;
    return {
        render: () => ({
            div: {
                className: () => `profile ${getState('ui.theme', 'light')}`,  // Default to 'light'
                children: [
                    {
                        h2: { 
                            text: () => `Welcome ${getState('auth.user.name', 'Guest')}`  // Default to 'Guest'
                        }
                    },
                    {
                        div: {
                            className: () => getState('ui.sidebar.collapsed', false) ? 'collapsed' : 'expanded'  // Default to false
                        }
                    },
                    {
                        span: {
                            text: () => `Items in cart: ${getState('cart.items', []).length}`  // Default to empty array
                        }
                    }
                ]
            }
        })
    };
};

const Settings = (props, context) => {
    const { getState, setState } = context;
    return {
        render: () => ({
            form: {
                children: [
                    {
                        input: {
                            type: 'text',
                            value: () => getState('settings.username', ''),  // Default to empty string
                            placeholder: 'Enter username',
                            oninput: (e) => setState('settings.username', e.target.value)
                        }
                    },
                    {
                        select: {
                            value: () => getState('settings.language', 'en'),  // Default to 'en'
                            onchange: (e) => setState('settings.language', e.target.value),
                            children: [
                                { option: { value: 'en', text: 'English' } },
                                { option: { value: 'es', text: 'Spanish' } },
                                { option: { value: 'fr', text: 'French' } }
                            ]
                        }
                    }
                ]
            }
        })
    };
};

// Key Benefits:
// 1. Components work immediately with sensible defaults
// 2. No need to pre-initialize state in configuration
// 3. State gets created naturally when first accessed
// 4. Default values provide fallback behavior
// 5. Components remain functional even if state is cleared/reset;

// UI Domain - Interface state
setState('ui.theme', 'dark');
setState('ui.mobileMenuOpen', true);
setState('ui.loading', false);

// Auth Domain - Authentication state  
setState('auth.user', { id: 123, name: 'John', role: 'admin' });
setState('auth.isLoggedIn', true);
setState('auth.permissions', ['read', 'write']);

// Data Domain - Application data
setState('data.products', productsArray);
setState('data.cart.items', cartItems);
setState('data.notifications.count', 5);

// Form Domain - Form state
setState('form.contact.name', 'John Doe');
setState('form.contact.email', 'john@example.com');
setState('form.contact.errors', {});

// Demo Domain - Example/demo state
setState('demo.counter', 42);
setState('demo.examples.active', 'counter'); 
```

## Accessing State from Components

Components can access any domain state directly - no prop drilling, no context providers, no complex subscriptions.

**Direct State Access**

```javascript
// Accessing Domain-Based State from Any Component

const UserProfile = (props, context) => ({
    render: () => ({
        div: {
            className: () => `profile ${getState('ui.theme')}`,  // UI domain
            children: [
                {
                    h2: { 
                        text: () => `Welcome ${getState('auth.user.name', 'Guest')}`  // Auth domain
                    }
                },
                {
                    p: { 
                        text: () => `Cart: ${getState('data.cart.items', []).length} items`  // Data domain
                    }
                },
                {
                    div: {
                        text: () => `Notifications: ${getState('data.notifications.count', 0)}`
                    }
                }
            ]
            }
        }
    })
});

// Component can be anywhere in the tree - state access remains the same
// No prop drilling, no context providers, no complex subscriptions
```

## How Reactivity Works

State is NOT reactive. Functions that call getState() become reactive. When you make a prop/attribute a function, Juris tracks which state it accesses and re-executes it when that state changes.

**Function-Based Reactivity**

```javascript
// Reactivity: Functions That Call getState() Become Reactive

const ReactiveExample = (props, context) => {
    const { getState, setState } = context;
    return {
        render: () => ({
            div: {
                // Static value - NEVER changes
                id: 'my-component',
                
                // Static getState call - evaluated once, NEVER updates
                title: getState('ui.theme', 'light'), // ❌ Not reactive
                
                // Function that calls getState - BECOMES reactive
                className: () => `component ${getState('ui.theme', 'light')}`, // ✅ Reactive
                
                children: () => {
                    const user = getState('auth.user');  // Tracks auth.user when function executes
                    
                    if (!user) {
                        // When user is null, this function only tracks auth.user
                        return [{ LoginForm: {} }];
                    }
                    
                    // When user exists, now tracks user-specific state
                    return [
                        { 
                            h1: { 
                                // Static text - NEVER updates even if user.name changes
                                text: `Hello ${user.name}`  // ❌ Not reactive
                            }
                        },
                        { 
                            h2: { 
                                // Function text - re-executes when auth.user.name changes
                                text: () => `Welcome ${getState('auth.user.name', 'Guest')}`  // ✅ Reactive
                            } 
                        },
                        {
                            div: {
                                children: () => {
                                    if (user.role === 'admin') {
                                        // Only tracks admin.notifications when user.role === 'admin'
                                        return [{ 
                                            AdminPanel: {
                                                count: () => getState('admin.notifications.count', 0)  // ✅ Reactive when admin
                                            }
                                        }];
                                    }
                                    return [{ UserDashboard: {} }];
                                }
                            }
                        }
                    ];
                }
            }
        })
    };
};

// Key Points:
// 1. setState('ui.theme', 'dark') just updates the value - nothing auto-happens
// 2. Functions that call getState() get tracked and re-executed
// 3. Static values/calls to getState() never update
// 4. You choose what's reactive by making it a function
```

## State Initialization with Defaults

Components can initialize state using default values. When state doesn't exist, getState() returns the default and the component works immediately.

**Default Value Initialization**

```javascript
// Components Initialize State with Default Values

const Counter = (props, context) => {
  const { getState, setState } = context;
  
  return {
    render: () => ({
      div: {
        children: [
          {
            p: {
              // If 'demo.counter' doesn't exist, uses 0 as default
              text: () => `Count: ${getState('demo.counter', 0)}`
            }
          },
          {
            button: {
              text: 'Increment',
              onclick: () => {
                // Gets current value (or 0 if doesn't exist) and increments
                const current = getState('demo.counter', 0);
                setState('demo.counter', current + 1);
              }
            }
          }
        ]
      }
    })
  };
};

const UserProfile = (props, context) => ({
 render: () => ({
   div: {
     className: () => `profile ${getState('ui.theme', 'light')}`,  // Default to 'light'
     children: [
       {
         h2: { 
           text: () => `Welcome ${getState('auth.user.name', 'Guest')}`  // Default to 'Guest'
         }
       },
       {
         div: {
           className: () => getState('ui.sidebar.collapsed', false) ? 'collapsed' : 'expanded'  // Default to false
         }
       },
       {
         span: {
           text: () => `Items in cart: ${getState('cart.items', []).length}`  // Default to empty array
         }
       }
     ]
   }
 })
});

const Settings = (props, context) => ({
 render: () => ({
   form: {
     children: [
       {
         input: {
           type: 'text',
           value: () => getState('settings.username', ''),  // Default to empty string
           placeholder: 'Enter username',
           oninput: (e) => setState('settings.username', e.target.value)
         }
       },
       {
         select: {
           value: () => getState('settings.language', 'en'),  // Default to 'en'
           onchange: (e) => setState('settings.language', e.target.value),
           children: [
             { option: { value: 'en', text: 'English' } },
             { option: { value: 'es', text: 'Spanish' } },
             { option: { value: 'fr', text: 'French' } }
           ]
         }
       }
     ]
   }
 })
});

// Key Benefits:
// 1. Components work immediately with sensible defaults
// 2. No need to pre-initialize state in configuration
// 3. State gets created naturally when first accessed
// 4. Default values provide fallback behavior
// 5. Components remain functional even if state is cleared/reset
```

## Temporal Independence

Components work immediately, even if the state they need doesn't exist yet. Updates happen automatically when data arrives.

**Work Before State Exists**

```javascript
// Temporal Independence - Components Work Before State Exists

const PerformanceDisplay = (props, context) => ({
render: () => ({
    div: {
        className: 'performance-badge',
        children: [
            {
                span: {
                    // Works immediately, updates when state becomes available
                    text: () => {
                        const renderTime = context.getState('metrics.renderTime');
                        if (renderTime && renderTime.duration !== undefined) {
                            return `⚡ Rendered in ${renderTime.duration.toFixed(1)}ms`;
                        }
                        return '⚡ Real-time performance';
                    }
                }
            }]
        }
    })
});

// Component renders immediately with fallback text
// Automatically updates when ui.renderTime is set later
// No coordination needed, no race conditions
```

## Component Mobility

Components can move anywhere in the UI tree without impacting their state access. No parent-child coupling.

**Location Independence**

```javascript
// Component Mobility - Works Anywhere Without State Impact

const ThemeToggle = (props, context) => {
  const { getState, setState } = context;
  
  return {
    render: () => ({
      button: {
        className: () => `theme-btn null `,
        text: () => getState('ui.theme') === 'dark' ? '☀️' : '🌙',
        onclick: () => {
          const current = getState('ui.theme');
          setState('ui.theme', current === 'dark' ? 'light' : 'dark');
        }
      }
    })
  };
};

// This component works identically in ANY location:
// <Header><ThemeToggle /></Header>
// <Sidebar><ThemeToggle /></Sidebar>  
// <Modal><ThemeToggle /></Modal>
// <Footer><ThemeToggle /></Footer>

// No parent-child coupling, no prop passing, no context configuration
```

## Branch-Aware Reactivity

Components only track state paths that actually execute. Change execution branches and dependency tracking automatically adapts.

**Execution-Aware Dependencies**

```javascript
// Branch-Aware Reactivity - Only Track What Actually Executes

const ConditionalComponent = (props, context) => {
  const { getState } = context;
  
  return {
    render: () => ({
      div: {
        children: () => {
          const viewMode = getState('ui.viewMode');  // Always tracked
          
          if (viewMode === 'grid') {
            // Only tracks grid-specific state when in grid mode
            return products.map(product => ({
              GridCard: {
                isSelected: () => getState(`selection.grid.${product.id}`)
              }
            }));
          }
          
          if (viewMode === 'list') {
            // Only tracks list-specific state when in list mode  
            return products.map(product => ({
              ListItem: {
                isExpanded: () => getState(`selection.list.${product.id}`)
              }
            }));
          }
          
          // Table mode - completely different dependencies
          return [{ DataTable: { sortBy: () => getState('table.sortBy') } }];
        }
      }
    })
  };
};

// When viewMode changes from 'grid' to 'list':
// - selection.grid.* changes are ignored (not in execution path)
// - selection.list.* changes start being tracked
// - Automatic dependency management, zero manual subscriptions
```

## Core Principles

#### 🌐 Global Access

Any component can access any state directly. No prop drilling or complex context setup.

#### 🏗️ Domain Organization

Organize state by logical domains (ui.*, auth.*, data.*) for clarity and maintainability.

#### ⚡ Zero Boilerplate

No reducers, actions, providers, or subscriptions. Just getState() and setState().

#### 🔄 Function-Based Reactivity

Make props/attributes functions that call getState() to make them reactive.

#### 🎯 Surgical Precision

Only components using changed state paths re-render. Maximum efficiency by default.

#### 🚫 Zero Race Conditions

Temporal independence eliminates timing issues and coordination complexity.

## State Management Summary

**State Management in Juris is simply domain-based global state access with automatic reactivity. No complex patterns, no boilerplate, no coordination logic - just get and set state organized by logical domains, with functions automatically tracking their dependencies.**