# **enhance() API**

Transform existing DOM elements into reactive components without rewrites. The ultimate progressive enhancement API.

## What is enhance()?

The enhance() API is Juris's revolutionary progressive enhancement system. It adds reactivity to existing DOM elements without changing the HTML, making legacy code reactive and enabling gradual migration to modern patterns.

#### 🎯 Zero Rewrites

Transform existing HTML into reactive components without changing a single line of markup.

#### 🔄 Full Reactivity

Enhanced elements get complete access to reactive state, event handlers, and framework features.

#### 🏗️ Nested Selectors

Enhance complex DOM structures with different behaviors for different child elements.

#### 🌐 Context Access

Enhanced elements have full access to headless components, services, and framework context.

## Basic Enhancement

Start with existing HTML and add reactivity without changing the markup.

**Basic Progressive Enhancement**

```javascript
// Basic Enhancement - Add Reactivity to Existing DOM
const app = new Juris({
    components: { /* your components */ }
});

// Enhance existing HTML elements with reactivity
app.enhance('#counter-btn', {
    text: () => `Clicked ${app.getState('counter', 0)} times`,
    onclick: () => {
        const current = app.getState('counter', 0);
        app.setState('counter', current + 1);
    }
});

// The HTML:
// <button id="counter-btn">Static Button</button>
// Becomes reactive without changing the HTML!
```

## Selector-Based Enhancement

Enhance multiple elements at once using CSS selectors. Perfect for lists, grids, and repeated elements.

**Multiple Element Enhancement**

```javascript
// Selector-Based Enhancement - Multiple Elements at Once
app.enhance('.themed-content', {
    className: () => {
        const theme = app.getState('ui.theme', 'light');
        return `themed-content ${theme}`;
    },
    style: () => ({
        opacity: app.getState('ui.visible', true) ? 1 : 0,
        transition: 'all 0.3s ease'
    })
});

// Enhances ALL elements with class 'themed-content'
// <div class="themed-content">Content 1</div>
// <div class="themed-content">Content 2</div>
// <div class="themed-content">Content 3</div>
// All become reactive simultaneously
```

## Nested Selectors

Enhance complex DOM structures with different behaviors for parent and child elements. Each selector gets its own enhancement configuration.

**Complex Nested Enhancement**

```javascript
// Nested Selectors - Complex Enhancement Patterns
app.enhance('.card-container', {
    // Enhance the container itself
    className: () => {
        const layout = app.getState('ui.layout', 'grid');
        return `card-container ${layout}-layout`;
    },
    
    // Enhance child elements with different behaviors
    selectors: {
        '.card': (context) => ({
            className: () => {
                const cardId = context.element.dataset.cardId;
                const isSelected = app.getState('selection.cards', []).includes(cardId);
                return `card ${isSelected ? 'selected' : ''}`;
            },
            onclick: () => {
                const cardId = context.element.dataset.cardId;
                const selected = app.getState('selection.cards', []);
                const newSelection = selected.includes(cardId)
                    ? selected.filter(id => id !== cardId)
                    : [...selected, cardId];
                app.setState('selection.cards', newSelection);
            }
        }),
        
        '.card-title': (context) => ({
            text: () => {
                const cardId = context.element.closest('.card').dataset.cardId;
                const cardData = app.getState(`data.cards.${cardId}`);
                return cardData?.title || 'Loading...';
            }
        }),
        
        '.card-actions .btn': (context) => ({
            disabled: () => {
                const action = context.element.dataset.action;
                const permissions = app.getState('auth.permissions', []);
                return !permissions.includes(action);
            },
            onclick: (event) => {
                const action = event.target.dataset.action;
                const cardId = event.target.closest('.card').dataset.cardId;
                app.setState(`actions.${action}`, { cardId, timestamp: Date.now() });
            }
        })
    }
});

// Complex HTML structure becomes fully reactive:
// <div class="card-container">
//   <div class="card" data-card-id="1">
//     <h3 class="card-title">Title</h3>
//     <div class="card-actions">
//       <button class="btn" data-action="edit">Edit</button>
//       <button class="btn" data-action="delete">Delete</button>
//     </div>
//   </div>
// </div>
```

## Context Access

Enhanced elements have full access to the Juris context, including headless components, services, and custom methods through function-based enhancement definitions.

**Full Framework Integration**

```javascript
// Context Access - Full Framework Integration
app.enhance('.user-profile', (context) => {
    // Access to all headless components, services, and state management
    const { getState, setState, headless, services } = context;
    
    // Destructure headless components for easier access
    const { DataManager, ApiManager, NotificationManager } = headless;
    
    // Helper functions using context (defined in enhancement scope)
    const loadUserData = async (userId) => {
        if (!ApiManager) return;
        
        try {
            const userData = await ApiManager.get(`/users/${userId}`);
            setState(`users.${userId}`, userData);
            if (NotificationManager) {
                NotificationManager.show('User data loaded');
            }
        } catch (error) {
            if (NotificationManager) {
                NotificationManager.error('Failed to load user data');
            }
        }
    };
    
    const refreshData = () => {
        if (DataManager?.refreshUserData) {
            DataManager.refreshUserData();
        }
    };
    
    return {
        className: () => {
            const user = getState('auth.user');
            const theme = getState('ui.theme', 'light');
            return `user-profile ${theme} ${user?.role || 'guest'}`;
        },
        
        // Click handler with access to helper functions
        onclick: () => {
            const user = getState('auth.user');
            if (user?.id) {
                loadUserData(user.id);
            }
        },
        
        // Double-click for refresh
        ondblclick: () => {
            refreshData();
        }
    };
});

// Enhanced refresh button with context access
app.enhance('.refresh-btn', (context) => {
    const { getState, headless } = context;
    const { DataManager } = headless;
    
    return {
        text: 'Refresh Data',
        onclick: () => {
            // Access headless component methods directly
            if (DataManager?.refreshUserData) {
                DataManager.refreshUserData();
            }
        },
        className: () => {
            const loading = getState('ui.loading', false);
            return loading ? 'refresh-btn loading' : 'refresh-btn';
        }
    };
});
```

## Form Enhancement

Transform static forms into reactive, validated forms with real-time feedback and error handling.

**Complete Form Enhancement**

```javascript
// Form Enhancement - Complex Form Handling
app.enhance('form.contact-form', (context) => {
    const { getState, setState } = context;
    
    // Form validation helper
    const validateContactForm = (data) => {
        const errors = {};
        
        if (!data.name || data.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!data.message || data.message.trim().length < 10) {
            errors.message = 'Message must be at least 10 characters';
        }
        
        return errors;
    };
    
    return {
        // Form-level enhancements
        className: () => {
            const isSubmitting = getState('form.contact.submitting', false);
            const hasErrors = Object.keys(getState('form.contact.errors', {})).length > 0;
            return `contact-form ${isSubmitting ? 'submitting' : ''} ${hasErrors ? 'has-errors' : ''}`;
        },
        
        onsubmit: async (event) => {
            event.preventDefault();
            
            // Set submitting state
            setState('form.contact.submitting', true);
            setState('form.contact.errors', {});
            
            try {
                const formData = new FormData(event.target);
                const data = Object.fromEntries(formData.entries());
                
                // Validate
                const errors = validateContactForm(data);
                if (Object.keys(errors).length > 0) {
                    setState('form.contact.errors', errors);
                    return;
                }
                
                // Submit
                await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                setState('form.contact.success', true);
                event.target.reset();
                
            } catch (error) {
                setState('form.contact.errors', { _form: error.message });
            } finally {
                setState('form.contact.submitting', false);
            }
        },
        
        // Field-specific enhancements
        selectors: {
            'input[name="email"]': (context) => ({
                className: () => {
                    const errors = getState('form.contact.errors', {});
                    return errors.email ? 'form-input error' : 'form-input';
                },
                oninput: (event) => {
                    setState('form.contact.email', event.target.value);
                    // Clear error on input
                    const errors = getState('form.contact.errors', {});
                    if (errors.email) {
                        delete errors.email;
                        setState('form.contact.errors', { ...errors });
                    }
                }
            }),
            
            '.error-message': (context) => ({
                text: () => {
                    const fieldName = context.element.dataset.field;
                    const errors = getState('form.contact.errors', {});
                    return errors[fieldName] || '';
                },
                style: () => ({
                    display: (() => {
                        const fieldName = context.element.dataset.field;
                        const errors = getState('form.contact.errors', {});
                        return errors[fieldName] ? 'block' : 'none';
                    })()
                })
            }),
            
            'button[type="submit"]': (context) => ({
                disabled: () => getState('form.contact.submitting', false),
                text: () => {
                    const submitting = getState('form.contact.submitting', false);
                    return submitting ? 'Sending...' : 'Send Message';
                }
            })
        }
    };
});
```

## Data Table Enhancement

Turn static HTML tables into fully interactive data grids with sorting, filtering, pagination, and row actions.

**Advanced Table Enhancement**

```javascript
// Data Table Enhancement - Complex List Management
app.enhance('.data-table', (context) => {
    const { getState, setState, headless } = context;
    const { ApiManager } = headless;
    
    // Helper functions for table operations
    const deleteRow = async (rowId) => {
        setState('table.loading', true);
        try {
            await ApiManager.delete(`/api/rows/${rowId}`);
            const data = getState('table.data', {});
            delete data[rowId];
            setState('table.data', { ...data });
        } finally {
            setState('table.loading', false);
        }
    };
    
    const loadTableData = async (page) => {
        setState('table.loading', true);
        try {
            const data = await ApiManager.get(`/api/table?page=${page}`);
            setState('table.data', data.rows);
            setState('table.totalPages', data.totalPages);
        } finally {
            setState('table.loading', false);
        }
    };
    
    return {
        className: () => {
            const loading = getState('table.loading', false);
            const view = getState('table.view', 'grid');
            return `data-table ${view}-view ${loading ? 'loading' : ''}`;
        },
        
        selectors: {
            // Header controls
            '.sort-header': (context) => ({
                className: () => {
                    const column = context.element.dataset.column;
                    const sortBy = getState('table.sortBy');
                    const sortDir = getState('table.sortDirection', 'asc');
                    return `sort-header ${sortBy === column ? 'active ' + sortDir : ''}`;
                },
                onclick: () => {
                    const column = context.element.dataset.column;
                    const currentSort = getState('table.sortBy');
                    const currentDir = getState('table.sortDirection', 'asc');
                    
                    if (currentSort === column) {
                        setState('table.sortDirection', currentDir === 'asc' ? 'desc' : 'asc');
                    } else {
                        setState('table.sortBy', column);
                        setState('table.sortDirection', 'asc');
                    }
                }
            }),
            
            // Row selection
            '.row-checkbox': (context) => ({
                checked: () => {
                    const rowId = context.element.dataset.rowId;
                    return getState('table.selected', []).includes(rowId);
                },
                onchange: (event) => {
                    const rowId = context.element.dataset.rowId;
                    const selected = getState('table.selected', []);
                    
                    if (event.target.checked) {
                        setState('table.selected', [...selected, rowId]);
                    } else {
                        setState('table.selected', selected.filter(id => id !== rowId));
                    }
                }
            }),
            
            // Row actions
            '.row-action': (context) => ({
                disabled: () => {
                    const action = context.element.dataset.action;
                    const rowId = context.element.dataset.rowId;
                    const permissions = getState('auth.permissions', []);
                    const rowData = getState(`table.data.${rowId}`);
                    
                    if (action === 'delete' && !permissions.includes('delete')) return true;
                    if (action === 'edit' && rowData?.locked) return true;
                    return false;
                },
                onclick: async (event) => {
                    const action = event.target.dataset.action;
                    const rowId = event.target.dataset.rowId;
                    
                    switch (action) {
                        case 'edit':
                            setState('ui.editingRow', rowId);
                            break;
                        case 'delete':
                            if (confirm('Are you sure?')) {
                                await deleteRow(rowId);
                            }
                            break;
                    }
                }
            }),
            
            // Pagination
            '.page-btn': (context) => ({
                className: () => {
                    const page = parseInt(context.element.dataset.page);
                    const currentPage = getState('table.currentPage', 1);
                    return `page-btn ${page === currentPage ? 'active' : ''}`;
                },
                onclick: () => {
                    const page = parseInt(context.element.dataset.page);
                    setState('table.currentPage', page);
                    loadTableData(page);
                }
            })
        }
    };
});
```

## Progressive Migration

Migrate legacy applications gradually without breaking existing functionality. Start with basic enhancements and progressively add more sophisticated behavior.

**Gradual Legacy Migration**

```javascript
// Progressive Migration - Legacy to Reactive
// Step 1: Start with existing HTML and basic enhancement
app.enhance('.legacy-widget', {
    className: () => {
        const theme = app.getState('ui.theme', 'light');
        return `legacy-widget ${theme}`;
    }
});

// Step 2: Add more sophisticated behavior
app.enhance('.legacy-widget', (context) => {
    const { getState, setState } = context;
    
    return {
        selectors: {
            '.legacy-button': (context) => ({
                onclick: () => {
                    // Bridge legacy JavaScript with reactive state
                    const widgetId = context.element.closest('.legacy-widget').id;
                    setState(`widgets.${widgetId}.clicked`, Date.now());
                    
                    // Still call legacy function if needed
                    if (window.legacyButtonClick) {
                        window.legacyButtonClick(widgetId);
                    }
                }
            }),
            
            '.legacy-display': (context) => ({
                text: () => {
                    const widgetId = context.element.closest('.legacy-widget').id;
                    const lastClicked = getState(`widgets.${widgetId}.clicked`);
                    return lastClicked 
                        ? `Last clicked: ${new Date(lastClicked).toLocaleTimeString()}`
                        : 'Not clicked yet';
                }
            })
        }
    };
});

// Step 3: Gradually replace with full components
// (Legacy code continues working while you migrate piece by piece)
```

## Enhancement Options

Fine-tune enhancement behavior with configuration options and batch processing for optimal performance.

**Advanced Configuration**

```javascript
// Enhancement Options - Configuration and Control
app.enhance('.advanced-component', (context) => {
    const { getState, setState, headless } = context;
    const { DataManager, NotificationManager } = headless;
    
    // Helper functions with context access
    const trackAnalytics = (eventName, data) => {
        setState('analytics.events', [
            ...getState('analytics.events', []),
            { eventName, data, timestamp: Date.now() }
        ]);
    };
    
    return {
        className: () => `component ${getState('ui.theme')}`,
        
        onclick: (event) => {
            const componentId = event.target.dataset.componentId;
            if (DataManager) {
                DataManager.trackInteraction(componentId);
            }
            if (NotificationManager) {
                NotificationManager.show('Component clicked');
            }
            trackAnalytics('component_clicked', { componentId });
        }
    };
}, {
    // Enhancement configuration options
    batchUpdates: true,           // Batch multiple DOM updates
    debounceMs: 16,              // Debounce rapid state changes
    observeNewElements: true,     // Auto-enhance dynamically added elements
    preserveExistingHandlers: false // Override existing event handlers
});

// Multiple Enhancement Calls - Process Different Elements
// Note: Each enhancement is applied separately
app.enhance('.card', cardEnhancement, { observeNewElements: true });
app.enhance('.button', buttonEnhancement, { debounceMs: 10 });
app.enhance('.input', inputEnhancement, { batchUpdates: true });

// Enhancement with progress tracking using state
app.setState('enhancement.progress', 0);

const enhanceWithProgress = async (selectors) => {
    const total = selectors.length;
    
    for (let i = 0; i < selectors.length; i++) {
        const { selector, config, options } = selectors[i];
        app.enhance(selector, config, options);
        
        // Update progress
        const progress = ((i + 1) / total) * 100;
        app.setState('enhancement.progress', progress);
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
    }
};

// Usage
enhanceWithProgress([
    { selector: '.card', config: cardEnhancement },
    { selector: '.button', config: buttonEnhancement },
    { selector: '.input', config: inputEnhancement }
]);
```

## Real-World Example

Complete e-commerce product grid enhancement showing how to transform a static HTML product listing into a fully interactive shopping interface.

**E-commerce Enhancement**

```javascript
// Real-World Example - E-commerce Product Grid
app.enhance('.product-grid', (context) => {
    const { getState, setState, headless } = context;
    const { ApiManager, NotificationManager } = headless;
    
    // Helper functions
    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(price);
    };
    
    return {
        className: () => {
            const view = getState('products.view', 'grid');
            const loading = getState('products.loading', false);
            return `product-grid ${view}-view ${loading ? 'loading' : ''}`;
        },
        
        selectors: {
            // Product cards
            '.product-card': (context) => ({
                className: () => {
                    const productId = context.element.dataset.productId;
                    const favorited = getState('user.favorites', []).includes(productId);
                    const inCart = getState('cart.items', []).some(item => item.productId === productId);
                    return `product-card ${favorited ? 'favorited' : ''} ${inCart ? 'in-cart' : ''}`;
                }
            }),
            
            // Favorite buttons
            '.favorite-btn': (context) => ({
                className: () => {
                    const productId = context.element.closest('.product-card').dataset.productId;
                    const favorited = getState('user.favorites', []).includes(productId);
                    return `favorite-btn ${favorited ? 'active' : ''}`;
                },
                onclick: async (event) => {
                    const productId = event.target.closest('.product-card').dataset.productId;
                    const favorites = getState('user.favorites', []);
                    
                    const newFavorites = favorites.includes(productId)
                        ? favorites.filter(id => id !== productId)
                        : [...favorites, productId];
                    
                    setState('user.favorites', newFavorites);
                    
                    // Sync with backend
                    if (ApiManager) {
                        try {
                            await ApiManager.post('/api/favorites', {
                                productId,
                                favorited: newFavorites.includes(productId)
                            });
                        } catch (error) {
                            // Revert on error
                            setState('user.favorites', favorites);
                            if (NotificationManager) {
                                NotificationManager.error('Failed to update favorites');
                            }
                        }
                    }
                }
            }),
            
            // Add to cart buttons
            '.add-to-cart': (context) => ({
                disabled: () => {
                    const productId = context.element.closest('.product-card').dataset.productId;
                    const product = getState(`products.data.${productId}`);
                    const inCart = getState('cart.items', []).some(item => item.productId === productId);
                    return !product?.inStock || inCart;
                },
                text: () => {
                    const productId = context.element.closest('.product-card').dataset.productId;
                    const inCart = getState('cart.items', []).some(item => item.productId === productId);
                    const product = getState(`products.data.${productId}`);
                    
                    if (inCart) return 'In Cart';
                    if (!product?.inStock) return 'Out of Stock';
                    return 'Add to Cart';
                },
                onclick: async (event) => {
                    const productId = event.target.closest('.product-card').dataset.productId;
                    const product = getState(`products.data.${productId}`);
                    
                    const cartItems = getState('cart.items', []);
                    const newItem = {
                        productId,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        addedAt: Date.now()
                    };
                    
                    setState('cart.items', [...cartItems, newItem]);
                    setState('cart.count', cartItems.length + 1);
                    
                    // Show confirmation
                    if (NotificationManager) {
                        NotificationManager.success(`${product.name} added to cart!`);
                    }
                    
                    // Analytics
                    setState('analytics.events', [
                        ...getState('analytics.events', []),
                        { event: 'add_to_cart', productId, timestamp: Date.now() }
                    ]);
                }
            }),
            
            // Price display
            '.price': (context) => ({
                text: () => {
                    const productId = context.element.closest('.product-card').dataset.productId;
                    const product = getState(`products.data.${productId}`);
                    const currency = getState('user.currency', 'USD');
                    
                    if (!product) return 'Loading...';
                    
                    const price = product.price;
                    const discount = product.discount || 0;
                    const finalPrice = price * (1 - discount);
                    
                    return formatPrice(finalPrice, currency);
                },
                className: () => {
                    const productId = context.element.closest('.product-card').dataset.productId;
                    const product = getState(`products.data.${productId}`);
                    return `price ${product?.discount ? 'discounted' : ''}`;
                }
            })
        }
    };
});
```

## API Reference

#### app.enhance(selector, config, options)

Main enhancement method. Config can be object or function that returns config. Options configure behavior.

#### Function-based Config

Use (context) => config to access framework context including headless components and services.

#### config.selectors

Object defining child element behaviors. Keys are CSS selectors, values are enhancement configs or functions.

#### options.batchUpdates

Boolean. Batch multiple DOM updates for better performance. Default: false.

#### options.debounceMs

Number. Debounce rapid state changes to prevent excessive DOM updates. Default: 0.

#### options.observeNewElements

Boolean. Automatically enhance dynamically added elements that match the selector. Default: false.

## enhance() API Summary

**The enhance() API represents the ultimate progressive enhancement solution - transforming existing HTML into reactive components without rewrites, enabling gradual migration to modern patterns while maintaining full access to Juris's powerful features. Use function-based configurations to access the complete framework context.**