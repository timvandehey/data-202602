# **Advanced Patterns**

Master advanced control flow patterns for building sophisticated applications with conditional rendering, permission guards, and dynamic component loading.

## Control Flow Components

Control flow components in Juris provide powerful abstractions for conditional rendering, list iteration, permission-based access control, and dynamic component loading. These patterns eliminate boilerplate code and provide clean, declarative solutions for complex UI logic.

#### 🔀 Conditional Logic

Show/hide content based on application state without manual DOM manipulation.

#### 🔄 List Rendering

Efficient iteration with automatic performance optimization and empty state handling.

#### 🛡️ Permission Guards

Role-based access control built into your component structure.

#### ⚡ Dynamic Loading

Runtime component selection for flexible, data-driven interfaces.

## 1. Conditional Component

The Conditional component provides clean if/else logic for showing different content based on state conditions.

**Conditional Component Implementation**

```javascript
// 1. Conditional Component - Show/Hide Based on State
const Conditional = (props, context) => {
    const { getState } = context;

    return {
        render: () => ({
            div: {
                className: props.className || '',
                children: () => {
                    const condition = typeof props.condition === 'function'
                        ? props.condition()
                        : getState(props.condition);

                    if (condition) {
                        const content = props.then || props.children;
                        return content ? [content].flat().filter(Boolean) : [];
                    } else {
                        const content = props.else;
                        return content ? [content].flat().filter(Boolean) : [];
                    }
                }
            }
        })
    };
};

// Usage Example
{
    Conditional: {
        condition: 'auth.isLoggedIn',
        then: { WelcomeMessage: {} },
        else: { LoginPrompt: {} }
    }
}
```

## 2. Switch Component

The Switch component handles multiple conditional branches efficiently, perfect for role-based UI rendering.

**Switch Component Implementation**

```javascript
// 2. Switch Component - Multiple Conditional Branches
const Switch = (props, context) => {
    const { getState } = context;

    return {
        render: () => ({
            div: {
                className: props.className || '',
                children: () => {
                    const switchValue = typeof props.value === 'function'
                        ? props.value()
                        : getState(props.value);

                    const cases = props.cases || {};

                    if (switchValue !== undefined && switchValue in cases) {
                        const content = cases[switchValue];
                        return content ? [content].flat().filter(Boolean) : [];
                    } else if (props.default) {
                        const content = props.default;
                        return content ? [content].flat().filter(Boolean) : [];
                    }

                    return [];
                }
            }
        })
    };
};

// Usage Example - Role-Based UI
{
    Switch: {
        value: 'auth.role',
        cases: {
            'admin': { AdminDashboard: {} },
            'user': { UserDashboard: {} },
            'guest': { GuestView: {} }
        },
        default: {
            div: { text: 'Unknown role - please contact administrator' }
        }
    }
}
```

## 3. For Component

The For component provides efficient list rendering with built-in performance optimization using the "ignore" pattern to preserve DOM structure when possible.

**For Component with Performance Optimization**

```javascript
// 3. For Component - List Rendering with Performance Optimization
const For = (props, context) => {
    const { getState, setState } = context;

    return {
        render: () => ({
            div: {
                className: props.className || '',
                children: () => {
                    const isLoading = typeof props.loading === 'function'
                        ? props.loading()
                        : props.loading && getState(props.loading);

                    if (isLoading && props.loadingContent) {
                        return [props.loadingContent].flat().filter(Boolean);
                    }

                    const items = typeof props.items === 'function'
                        ? props.items()
                        : getState(props.items, []);

                    if (!items || items.length === 0) {
                        if (props.emptyContent) {
                            return [props.emptyContent].flat().filter(Boolean);
                        }
                        return [];
                    }

                    // Performance optimization with "ignore"
                    const currentLength = items.length;
                    const cacheKey = `_forComponent_${props.items}_length`;
                    const previousLength = getState(cacheKey, -1);

                    if (currentLength === previousLength && previousLength > 0) {
                        return "ignore"; // Preserve DOM structure
                    }

                    setState(cacheKey, currentLength);

                    const keyPath = props.keyPath || 'id';

                    return items.map((item, index) => {
                        let key;
                        if (typeof keyPath === 'function') {
                            key = keyPath(item, index);
                        } else if (typeof item === 'object' && item !== null) {
                            key = keyPath.split('.').reduce((obj, path) => obj?.[path], item) || index;
                        } else {
                            key = index;
                        }

                        const content = props.render(item, index);

                        if (content && typeof content === 'object' && !Array.isArray(content)) {
                            const tagName = Object.keys(content)[0];
                            if (tagName && content[tagName]) {
                                content[tagName].key = key;
                            }
                        }

                        return content;
                    }).filter(Boolean);
                }
            }
        })
    };
};

// Usage Example - User List
{
    For: {
        items: 'demo.users',
        render: (user) => ({
            UserCard: { userId: user.id }
        }),
        emptyContent: {
            div: {
                text: '👥 No users yet. Click "Add User" to start!',
                style: { textAlign: 'center', padding: '20px', color: '#666' }
            }
        }
    }
}
```

## 4. Guard Component

The Guard component implements permission-based access control, allowing you to show/hide content based on user permissions.

**Guard Component for Access Control**

```javascript
// 4. Guard Component - Permission-Based Rendering
const Guard = (props, context) => {
    const { getState } = context;

    return {
        render: () => ({
            div: {
                children: () => {
                    const userPermissions = getState('auth.permissions', []);
                    const requiredPermissions = props.permissions || [];
                    const requireAll = props.requireAll !== false;

                    const hasPermission = requireAll
                        ? requiredPermissions.every(perm => userPermissions.includes(perm))
                        : requiredPermissions.some(perm => userPermissions.includes(perm));

                    if (hasPermission) {
                        return props.children ? [props.children].flat().filter(Boolean) : [];
                    } else {
                        return props.fallback ? [props.fallback].flat().filter(Boolean) : [];
                    }
                }
            }
        })
    };
};

// Usage Example - Admin Panel Protection
{
    Guard: {
        permissions: ['admin'],
        children: {
            div: {
                children: [
                    { h4: { text: '🔐 Admin Panel' } },
                    { p: { text: 'Secret admin content!' } }
                ]
            }
        },
        fallback: {
            div: {
                className: 'access-denied',
                children: [
                    { h4: { text: '🚫 Access Denied' } },
                    { p: { text: 'You need admin permissions to view this content.' } }
                ]
            }
        }
    }
}
```

## 5. Show Component

The Show component controls visibility using CSS display properties, maintaining component state while hiding/showing content.

**Show Component for Visibility Control**

```javascript
// 5. Show Component - Visibility Control
const Show = (props, context) => {
    const { getState } = context;

    return {
        render: () => ({
            div: {
                style: () => ({
                    display: (() => {
                        const condition = typeof props.when === 'function'
                            ? props.when()
                            : getState(props.when);
                        return condition ? 'block' : 'none';
                    })()
                }),
                children: props.children ? [props.children].flat().filter(Boolean) : []
            }
        })
    };
};

// Usage Example - Content Visibility
{
    Show: {
        when: 'ui.showContent',
        children: { RevealableContent: {} }
    }
}
```

## 6. Dynamic Component

The Dynamic component enables runtime component selection, perfect for plugin systems and data-driven interfaces.

**Dynamic Component Loading**

```javascript
// 6. Dynamic Component - Runtime Component Loading
const Dynamic = (props, context) => {
    const { getState } = context;

    return {
        render: () => ({
            div: {
                children: () => {
                    const componentName = typeof props.component === 'function'
                        ? props.component()
                        : getState(props.component);

                    // Create the component reference dynamically
                    if (componentName) {
                        // Return the component as a child
                        return [{
                            [componentName]: props.props || {}
                        }];
                    }

                    // Fallback content
                    const fallback = props.fallback || {
                        div: {
                            style: { textAlign: 'center', padding: '20px', color: '#666' },
                            children: [
                                { h4: { text: '🎯 Dynamic Components' } },
                                { p: { text: 'Select a widget above to load it dynamically!' } }
                            ]
                        }
                    };

                    return [fallback];
                }
            }
        })
    };
};

// Usage Example - Widget Loader
{
    Dynamic: {
        component: 'ui.currentWidget',
        fallback: {
            div: {
                className: 'widget-container',
                children: [
                    { h4: { text: '🎯 Dynamic Components' } },
                    { p: { text: 'Select a widget above to load it dynamically!' } }
                ]
            }
        }
    }
}
```

## 7. Repeat Component

The Repeat component generates a specified number of elements, useful for ratings, pagination, and repeated UI patterns.

**Repeat Component for Pattern Generation**

```javascript
// 7. Repeat Component - Generate Repeated Elements
const Repeat = (props, context) => {
    return {
        render: () => ({
            div: {
                className: props.className || '',
                children: () => {
                    const times = typeof props.times === 'function'
                        ? props.times()
                        : props.times || 0;

                    return Array.from({ length: times }, (_, index) =>
                        props.render ? props.render(index) : null
                    ).filter(Boolean);
                }
            }
        })
    };
};

// Usage Example - Star Rating
{
    Repeat: {
        times: 5,
        render: (index) => ({
            span: {
                className: () => {
                    const rating = getState('demo.rating', 3);
                    return index < rating ? 'star' : 'star empty';
                },
                text: '★'
            }
        })
    }
}
```

## 8. Await Component

The Await component handles asynchronous operations with loading states, error handling, and success rendering.

**Await Component for Async Operations**

```javascript
// 8. Await Component - Async Data Handling
const Await = (props, context) => {
    const { getState, setState } = context;

    return {
        hooks: {
            onMount: async () => {
                if (props.promise) {
                    setState('await.loading', true);
                    setState('await.error', null);
                    setState('await.data', null);

                    try {
                        const promise = typeof props.promise === 'function'
                            ? props.promise()
                            : props.promise;
                        const data = await promise;
                        setState('await.data', data);
                    } catch (error) {
                        setState('await.error', error);
                    } finally {
                        setState('await.loading', false);
                    }
                }
            }
        },
        render: () => ({
            div: {
                children: () => {
                    const loading = getState('await.loading', false);
                    const error = getState('await.error', null);
                    const data = getState('await.data', null);

                    if (loading && props.loading) {
                        return [props.loading].flat().filter(Boolean);
                    }

                    if (error && props.error) {
                        return [props.error(error)].flat().filter(Boolean);
                    }

                    if (data && props.then) {
                        return [props.then(data)].flat().filter(Boolean);
                    }

                    return [];
                }
            }
        })
    };
};

// Usage Example - API Data Loading
{
    Await: {
        promise: () => fetch('/api/users').then(r => r.json()),
        loading: {
            div: {
                text: 'Loading users...',
                className: 'loading-spinner'
            }
        },
        then: (users) => ({
            For: {
                items: users,
                render: (user) => ({ UserCard: { user } })
            }
        }),
        error: (error) => ({
            div: {
                text: `Error: ${error.message}`,
                className: 'error-message'
            }
        })
    }
}
```

## Complex Pattern Composition

Real-world applications often require combining multiple control flow patterns. Here's an example of a complex dashboard that uses multiple control components together.

**Complex Pattern: Multi-Level Conditional Dashboard**

```javascript
// Complex Pattern: Conditional Loading with Guards
const UserDashboard = (props, context) => {
    const { getState, setState } = context;

    return {
        render: () => ({
            div: {
                className: 'dashboard-container',
                children: [
                    // Authentication Check
                    {
                        Conditional: {
                            condition: 'auth.isLoggedIn',
                            then: [
                                // Permission-Based Content
                                {
                                    Guard: {
                                        permissions: ['dashboard_access'],
                                        children: [
                                            // Role-Based Dashboard
                                            {
                                                Switch: {
                                                    value: 'auth.user.role',
                                                    cases: {
                                                        'admin': {
                                                            div: {
                                                                children: [
                                                                    { h2: { text: 'Admin Dashboard' } },
                                                                    // Dynamic Widget Loading
                                                                    {
                                                                        For: {
                                                                            items: 'admin.widgets',
                                                                            render: (widget) => ({
                                                                                Dynamic: {
                                                                                    component: widget.type,
                                                                                    props: widget.config
                                                                                }
                                                                            })
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        'user': {
                                                            div: {
                                                                children: [
                                                                    { h2: { text: 'User Dashboard' } },
                                                                    // Conditional Feature Display
                                                                    {
                                                                        Show: {
                                                                            when: 'user.features.analytics',
                                                                            children: { AnalyticsWidget: {} }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    },
                                                    default: {
                                                        div: { text: 'Unknown user role' }
                                                    }
                                                }
                                            }
                                        ],
                                        fallback: {
                                            div: {
                                                text: 'Access denied. Contact administrator.',
                                                className: 'access-denied'
                                            }
                                        }
                                    }
                                }
                            ],
                            else: {
                                div: {
                                    text: 'Please log in to access the dashboard',
                                    className: 'login-prompt'
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

## Best Practices

#### 🎯 Single Responsibility

Each control component should handle one specific type of logic - conditions, permissions, or iteration.

#### ⚡ Performance First

Use "ignore" pattern in For components and consider caching strategies for expensive computations.

#### 🔄 State Dependencies

Keep state paths consistent and predictable. Use domain-based organization for related state.

#### 🛡️ Graceful Fallbacks

Always provide fallback content for guards, async operations, and dynamic components.

#### 🧪 Testable Logic

Keep conditional logic simple and testable. Complex logic should be in helper functions.

#### 📊 Debug Friendly

Use meaningful state paths and provide debug information for complex control flows.

## Why Use Control Flow Components?

#### 🧹 Cleaner Code

Eliminate manual DOM manipulation and complex conditional logic scattered throughout components.

#### 📖 Declarative

Express what you want to happen, not how to do it. Control flow becomes part of your component structure.

#### ♻️ Reusable Logic

Control flow patterns become reusable components that can be used consistently across your application.

#### ⚡ Performance Optimized

Built-in optimizations like the "ignore" pattern and precise reactivity tracking.

#### 🔒 Type Safety

Consistent patterns make it easier to add TypeScript support and catch errors early.

#### 🧪 Easier Testing

Control flow logic is isolated in components, making it easier to test different scenarios.

## Advanced Patterns Summary

**Control flow components transform complex conditional logic into clean, declarative patterns. By using these advanced patterns, you can build sophisticated applications with permission systems, dynamic interfaces, and complex data flows while maintaining clean, readable code that leverages Juris's reactive architecture.**