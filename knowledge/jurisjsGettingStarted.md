# **Getting Started**

Master Juris Object DOM syntax and reactive patterns for building modern web applications with pure JavaScript.

## Quick Start

Get started with Juris in minutes. No build tools, no configuration, just pure JavaScript.

**Basic Application**

```javascript
const App = (props, context) => {
  const { getState, setState } = context;
  
  return {
    render: () => ({
      div: {
        children: [
          { h1: { text: 'Hello World' } },
          {
            button: {
              text: () => `Clicked ${getState('count', 0)} times`,
              onclick: () => setState('count', getState('count', 0) + 1)
            }
          }
        ]
      }
    })
  };
};

const juris = new Juris({
  components: { App },
  layout: { App: {} }
});

juris.render('#app');
```

## Object DOM Syntax Basics

Object DOM is Juris's revolutionary way to describe UI structure using pure JavaScript objects. No JSX, no templates, no compilation.

**Object DOM Structure**

```javascript
// Object DOM Syntax: { tagName: { properties } }

// Basic element
{ div: { text: 'Hello World' } }
// Renders: <div>Hello World</div>

// Element with attributes
{ 
  div: { 
    id: 'my-div',
    className: 'container',
    text: 'Content here'
  } 
}
// Renders: <div id="my-div" class="container">Content here</div>

// Element with children
{
  div: {
    className: 'parent',
    children: [
      { h1: { text: 'Title' } },
      { p: { text: 'Paragraph' } },
      { span: { text: 'Span content' } }
    ]
  }
}
// Renders:
// <div class="parent">
//   <h1>Title</h1>
//   <p>Paragraph</p>
//   <span>Span content</span>
// </div>
```

## Reactive vs Static Values

The fundamental principle of Juris: Functions are reactive (update automatically), values are static (never change).

**Static vs Reactive Patterns**

```javascript
// Static vs Reactive Values in Object DOM

// STATIC VALUES (don't change)
{
  div: {
    id: 'static-id',                    // Always 'static-id'
    className: 'always-blue',           // Always 'always-blue'
    text: 'Never changes'               // Always 'Never changes'
  }
}

// REACTIVE VALUES (update automatically)
{
  div: {
    id: () => `user-${getState('currentUser.id')}`,           // Updates when user changes
    className: () => getState('ui.theme') === 'dark' ? 'dark' : 'light',  // Updates when theme changes
    text: () => `Hello ${getState('user.name', 'Guest')}`,              // Updates when name changes
    style: () => ({ 
      opacity: getState('ui.visible') ? 1 : 0,                   // Updates when visibility changes
      color: getState('ui.primaryColor', '#000')                 // Updates when color changes
    })
  }
}

// KEY PRINCIPLE: Functions = Reactive, Values = Static
```

## Attributes and Events

Handle HTML attributes and DOM events naturally within Object DOM structure.

**Attributes and Event Handlers**

```javascript
// Object DOM Attributes and Events

{
  input: {
    // Standard HTML attributes
    type: 'text',
    id: 'username',
    className: 'form-input',
    placeholder: 'Enter username',
    required: true,
    disabled: false,
    
    // Reactive attributes
    value: () => getState('form.username', ''),
    className: () => getState('form.errors.username') ? 'form-input error' : 'form-input',
    
    // Event handlers (always functions)
    onclick: (e) => console.log('Input clicked'),
    oninput: (e) => setState('form.username', e.target.value),
    onfocus: (e) => setState('form.activeField', 'username'),
    onblur: (e) => setState('form.activeField', null),
    
    // Form events
    onchange: (e) => validateUsername(e.target.value),
    onkeydown: (e) => {
      if (e.key === 'Enter') {
        submitForm();
      }
    }
  }
}

// Common event patterns:
{
  button: {
    text: 'Submit',
    onclick: () => setState('form.submitted', true),
    ondblclick: () => setState('form.fastSubmit', true),
    onmouseenter: () => setState('ui.buttonHovered', true),
    onmouseleave: () => setState('ui.buttonHovered', false)
  }
}
```

## Children Patterns

Master different approaches to rendering child elements, from static arrays to dynamic reactive structures.

**Children Rendering Patterns**

```javascript
// Children Patterns in Object DOM

// 1. ARRAY OF ELEMENTS (most common)
{
  div: {
    children: [
      { h1: { text: 'Title' } },
      { p: { text: 'Paragraph 1' } },
      { p: { text: 'Paragraph 2' } }
    ]
  }
}

// 2. SINGLE CHILD ELEMENT
{
  div: {
    children: { p: { text: 'Single paragraph' } }
  }
}

// 3. REACTIVE CHILDREN (dynamic structure)
{
  div: {
    children: () => {
      const user = getState('auth.user');
      
      if (!user) {
        return [{ LoginForm: {} }];
      }
      
      return [
        { h1: { text: `Welcome, ${user.name}` } },
        { UserDashboard: {} },
        user.isAdmin ? { AdminPanel: {} } : null
      ].filter(Boolean);
    }
  }
}

// 4. MIXED STATIC AND REACTIVE
{
  div: {
    children: [
      { header: { text: 'Always visible header' } },  // Static
      () => {                                          // Reactive section
        const showContent = getState('ui.showContent');
        return showContent ? [
          { main: { children: [{ ContentArea: {} }] } },
          { sidebar: { children: [{ SidebarWidget: {} }] } }
        ] : [
          { div: { text: 'Content hidden', className: 'placeholder' } }
        ];
      },
      { footer: { text: 'Always visible footer' } }   // Static
    ]
  }
}
```

## Styling Approaches

Prefer CSS classes for static styles, use reactive inline styles only when values need to change dynamically.

**Styling Best Practices**

```javascript
// Styling in Object DOM

// 1. CSS CLASSES (recommended for static styles)
{
  div: {
    className: 'card shadow-lg rounded-md p-4'  // Static classes
  }
}

// 2. REACTIVE CSS CLASSES
{
  div: {
    className: () => {
      const theme = getState('ui.theme');
      const isActive = getState('component.isActive');
      
      const classes = ['base-component'];
      if (theme === 'dark') classes.push('dark-theme');
      if (isActive) classes.push('active');
      
      return classes.join(' ');
    }
  }
}

// 3. INLINE STYLES (use sparingly, mainly for reactive values)
{
  div: {
    style: {
      position: 'relative',           // Static style
      zIndex: 10,                     // Static style
      width: '100%'                   // Static style
    }
  }
}

// 4. REACTIVE INLINE STYLES
{
  div: {
    style: () => ({
      opacity: getState('ui.visible') ? 1 : 0,
      transform: `translateX(${getState('ui.offset', 0)}px)`,
      backgroundColor: getState('ui.theme') === 'dark' ? '#333' : '#fff',
      color: getState('ui.theme') === 'dark' ? '#fff' : '#333'
    })
  }
}

// 5. MIXED STYLING APPROACH (best practice)
{
  div: {
    className: 'card',  // Static base styles in CSS
    className: () => `card ${getState('ui.theme')}`,  // Add reactive classes
    style: () => ({
      // Only reactive styles inline
      opacity: getState('component.visible') ? 1 : 0
    })
  }
}
```

## Component Usage

Use components within Object DOM, including the revolutionary DOM objects as props pattern.

**Component Composition**

```javascript
// Using Components in Object DOM

// 1. SIMPLE COMPONENT USAGE
{
  div: {
    children: [
      { Header: {} },                    // Component with no props
      { UserProfile: { userId: 123 } }, // Component with static props
      { Footer: {} }
    ]
  }
}

// 2. COMPONENTS WITH REACTIVE PROPS
{
  div: {
    children: [
      {
        UserCard: {
          userId: () => getState('ui.selectedUser'),        // Reactive prop
          theme: () => getState('ui.theme'),                // Reactive prop
          showDetails: () => getState('ui.showUserDetails') // Reactive prop
        }
      }
    ]
  }
}

// 3. COMPONENTS WITH DOM OBJECT PROPS (powerful!)
{
  Modal: {
    isOpen: () => getState('modal.isOpen'),
    header: {
      div: {
        className: 'modal-header',
        children: [
          { h2: { text: 'Settings' } },
          { 
            button: { 
              text: '×', 
              onclick: () => setState('modal.isOpen', false) 
            } 
          }
        ]
      }
    },
    body: [
      { SettingsForm: {} },
      { PreferencesPanel: {} }
    ],
    footer: () => {
      const hasChanges = getState('settings.hasChanges');
      return {
        div: {
          className: 'modal-footer',
          children: hasChanges ? [
            { button: { text: 'Save', onclick: () => saveSettings() } },
            { button: { text: 'Cancel', onclick: () => cancelChanges() } }
          ] : [
            { button: { text: 'Close', onclick: () => closeModal() } }
          ]
        }
      };
    }
  }
}

// 4. CONDITIONAL COMPONENT RENDERING
{
  div: {
    children: () => {
      const userRole = getState('auth.user.role');
      const components = [{ PublicContent: {} }];
      
      if (userRole === 'user') {
        components.push({ UserDashboard: {} });
      }
      
      if (userRole === 'admin') {
        components.push({ UserDashboard: {} }, { AdminPanel: {} });
      }
      
      return components;
    }
  }
}
```

## Complete Form Example

A comprehensive example showing Object DOM in action with forms, validation, and state management.

**Real-World Form Component**

```javascript
// Complete Form Example with Object DOM

const ContactForm = (props, context) => {
  const { getState, setState } = context;
  
  return {
    render: () => ({
      form: {
        className: 'contact-form',
        onsubmit: (e) => {
          e.preventDefault();
          submitForm();
        },
        children: [
          {
            div: {
              className: 'form-group',
              children: [
                { 
                  label: { 
                    htmlFor: 'name',
                    text: 'Name:' 
                  } 
                },
                {
                  input: {
                    type: 'text',
                    id: 'name',
                    className: () => {
                      const error = getState('form.errors.name');
                      return error ? 'form-input error' : 'form-input';
                    },
                    value: () => getState('form.name', ''),
                    oninput: (e) => {
                      setState('form.name', e.target.value);
                      clearError('name');
                    },
                    placeholder: 'Enter your name'
                  }
                },
                {
                  div: {
                    className: 'error-message',
                    text: () => getState('form.errors.name', ''),
                    style: () => ({
                      display: getState('form.errors.name') ? 'block' : 'none'
                    })
                  }
                }
              ]
            }
          },
          {
            div: {
              className: 'form-group',
              children: [
                { 
                  label: { 
                    htmlFor: 'email',
                    text: 'Email:' 
                  } 
                },
                {
                  input: {
                    type: 'email',
                    id: 'email',
                    className: () => {
                      const error = getState('form.errors.email');
                      return error ? 'form-input error' : 'form-input';
                    },
                    value: () => getState('form.email', ''),
                    oninput: (e) => {
                      setState('form.email', e.target.value);
                      clearError('email');
                    },
                    placeholder: 'Enter your email'
                  }
                },
                {
                  div: {
                    className: 'error-message',
                    text: () => getState('form.errors.email', ''),
                    style: () => ({
                      display: getState('form.errors.email') ? 'block' : 'none'
                    })
                  }
                }
              ]
            }
          },
          {
            div: {
              className: 'form-actions',
              children: [
                {
                  button: {
                    type: 'submit',
                    className: 'btn btn-primary',
                    disabled: () => getState('form.submitting', false),
                    text: () => getState('form.submitting') ? 'Sending...' : 'Send Message'
                  }
                },
                {
                  button: {
                    type: 'button',
                    className: 'btn btn-secondary',
                    text: 'Clear',
                    onclick: () => clearForm()
                  }
                }
              ]
            }
          }
        ]
      }
    })
  };

  function submitForm() {
    // Form submission logic
  }

  function clearError(field) {
    setState(`form.errors.${field}`, null);
  }

  function clearForm() {
    setState('form.name', '');
    setState('form.email', '');
    setState('form.errors', {});
  }
};
```

## Core Principles

#### 🎯 Object DOM Structure

{ tagName: { properties } } - Pure JavaScript objects describe your entire UI structure.

#### ⚡ Functions = Reactive

Use functions for values that should update automatically when state changes.

#### 🔒 Values = Static

Use direct values for content that never changes during component lifetime.

#### 🚫 No Build Tools

No JSX, no compilation, no transpilation. Just pure JavaScript that runs everywhere.

#### 🎨 DOM Objects as Props

Pass entire UI structures as props for ultimate composition flexibility.

#### 🔄 Automatic Dependencies

No manual subscriptions. Components automatically track exactly what state they access.