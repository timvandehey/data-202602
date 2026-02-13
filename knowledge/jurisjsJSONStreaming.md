# **JSON Streaming**

Stream pure JSON content and progressively enhance with Juris for optimal performance and flexibility. Achieve 68% smaller payloads and blazing-fast rendering.

## What is JSON Streaming?

JSON Streaming is a revolutionary pattern where you deliver pure JSON data from your API and use Juris's Object DOM to render it directly in the browser. This eliminates the need for server-side HTML generation while enabling progressive enhancement.

#### 📦 68% Smaller Payloads

Pure JSON is dramatically smaller than HTML with embedded JavaScript.

#### ⚡ Instant Rendering

Object DOM renders JSON directly without parsing or compilation steps.

#### 🔄 Progressive Enhancement

Add interactivity after initial render for optimal performance.

#### 🌐 Real-Time Ready

Perfect for WebSocket updates and live data streaming.

## Basic JSON Streaming Implementation

Start streaming JSON content in three simple steps: fetch JSON data, render with Object DOM, and enhance with reactivity.

**Basic JSON Streaming Pattern**

```javascript
// JSON Streaming with Juris
// 1. Stream pure JSON data from your API
const streamArticles = async () => {
    const response = await fetch('/api/articles/stream');
    const articles = await response.json();
    
    // 2. Render directly using Juris Object DOM
    articles.forEach(article => {
        const articleElement = app.domRenderer.render({
            article: {
                className: 'article fade-in',
                'data-article-id': article.id,
                children: [
                    {
                        h2: {
                            className: 'article-title',
                            text: article.title
                        }
                    },
                    {
                        p: {
                            className: 'article-excerpt',
                            text: article.excerpt
                        }
                    },
                    {
                        button: {
                            className: 'like-btn',
                            text: `❤️ ${article.likes}`,
                            'data-article-id': article.id
                        }
                    }
                ]
            }
        });
        
        container.appendChild(articleElement);
    });
    
    // 3. Progressive enhancement after rendering
    enhanceWithReactivity();
};
```

## JSON Component Factory Pattern

Create component factories that transform JSON data into Object DOM structures. This pattern provides type safety and reusable rendering logic.

**Component Factory for JSON Data**

```javascript
// JSON Component Factory Pattern
function createNewsArticleFactory() {
    return function NewsArticleFactory(props, context) {
        const { articleData } = props;

        return {
            article: {
                className: 'article fade-in',
                'data-article-id': articleData.id,
                'data-category': articleData.category,
                children: [
                    {
                        img: {
                            className: 'article-image',
                            src: articleData.image,
                            alt: articleData.title,
                            loading: 'lazy'
                        }
                    },
                    {
                        div: {
                            className: 'article-content',
                            children: [
                                {
                                    div: {
                                        className: 'article-meta',
                                        children: [
                                            {
                                                span: {
                                                    className: 'category-tag',
                                                    text: articleData.category.charAt(0).toUpperCase() + articleData.category.slice(1)
                                                }
                                            },
                                            {
                                                span: {
                                                    text: articleData.publishDate
                                                }
                                            },
                                            {
                                                span: {
                                                    text: `${articleData.readTime} min read`
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    h2: {
                                        className: 'article-title',
                                        text: articleData.title
                                    }
                                },
                                {
                                    p: {
                                        className: 'article-excerpt',
                                        text: articleData.excerpt
                                    }
                                },
                                {
                                    div: {
                                        className: 'article-actions',
                                        children: [
                                            {
                                                button: {
                                                    className: 'engagement-btn like-btn',
                                                    'data-article-id': articleData.id,
                                                    text: `❤️ ${articleData.likes}`
                                                }
                                            },
                                            {
                                                button: {
                                                    className: 'engagement-btn comment-btn',
                                                    'data-article-id': articleData.id,
                                                    text: `💬 ${articleData.comments}`
                                                }
                                            },
                                            {
                                                button: {
                                                    className: 'engagement-btn bookmark-btn',
                                                    'data-article-id': articleData.id,
                                                    text: '🔖 Bookmark'
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
        };
    };
}

// Register the factory
const app = new Juris({
    renderMode: 'batch',
    components: {
        NewsArticle: createNewsArticleFactory()
    }
});
```

## Progressive Enhancement After Streaming

After streaming and rendering JSON content, use Juris's enhance() API to add reactive behaviors and state management.

**Progressive Enhancement Implementation**

```javascript
// Progressive Enhancement After Streaming
function enhanceArticles() {
    // 1. Enhance like buttons with reactive state
    app.enhance('.like-btn', (context) => {
        const { getState, setState } = context;
        
        return {
            onclick: (event) => {
                const articleId = event.target.dataset.articleId;
                const liked = getState(`articles.${articleId}.liked`, false);
                const likes = getState(`articles.${articleId}.likes`,
                    parseInt(event.target.textContent.replace(/[^\d]/g, '')) || 0);

                const newLiked = !liked;
                const newLikes = newLiked ? likes + 1 : likes - 1;

                // Update reactive state
                setState(`articles.${articleId}.liked`, newLiked);
                setState(`articles.${articleId}.likes`, newLikes);

                // Update UI
                event.target.textContent = `❤️ ${newLikes}`;
                event.target.classList.toggle('liked', newLiked);
            }
        };
    });

    // 2. Enhance bookmark functionality
    app.enhance('.bookmark-btn', (context) => {
        const { getState, setState } = context;
        
        return {
            onclick: (event) => {
                const articleId = event.target.dataset.articleId;
                const bookmarked = getState(`articles.${articleId}.bookmarked`, false);

                setState(`articles.${articleId}.bookmarked`, !bookmarked);

                event.target.textContent = !bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark';
                event.target.classList.toggle('bookmarked', !bookmarked);
            }
        };
    });

    // 3. Enhance category filtering
    app.enhance('.category-tag', (context) => {
        const { getState, setState } = context;
        
        return {
            onclick: (event) => {
                const category = event.target.textContent.toLowerCase();
                
                // Update global filter state
                setState('app.activeCategory', category);
                
                // Filter articles based on state
                filterArticlesByCategory(category);
            }
        };
    });
}
```

## Real-Time JSON Streaming

Combine JSON streaming with WebSockets for real-time content updates. Stream live data and update existing content seamlessly.

**Real-Time WebSocket JSON Streaming**

```javascript
// Real-Time JSON Streaming with WebSockets
class JSONStreamManager {
    constructor(app) {
        this.app = app;
        this.ws = null;
        this.container = null;
    }

    connect(wsUrl, containerId) {
        this.container = document.getElementById(containerId);
        this.ws = new WebSocket(wsUrl);

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleStreamedContent(data);
            } catch (error) {
                console.error('Invalid JSON received:', error);
            }
        };

        this.ws.onopen = () => {
            console.log('✅ JSON streaming connected');
            this.app.setState('stream.status', 'connected');
        };

        this.ws.onclose = () => {
            console.log('🔌 JSON streaming disconnected');
            this.app.setState('stream.status', 'disconnected');
            
            // Auto-reconnect after 3 seconds
            setTimeout(() => this.connect(wsUrl, containerId), 3000);
        };
    }

    handleStreamedContent(data) {
        switch (data.type) {
            case 'article':
                this.renderArticle(data.payload);
                break;
            case 'update':
                this.updateExistingContent(data.payload);
                break;
            case 'batch':
                data.payload.forEach(item => this.renderArticle(item));
                break;
        }
    }

    renderArticle(articleData) {
        // Calculate JSON size for performance tracking
        const jsonSize = new Blob([JSON.stringify(articleData)]).size;
        
        // Update performance metrics
        this.app.setState('stream.totalSize', 
            this.app.getState('stream.totalSize', 0) + jsonSize);

        // Render using Object DOM
        const articleElement = this.app.domRenderer.render({
            article: {
                className: 'article stream-entry',
                'data-article-id': articleData.id,
                style: {
                    animation: 'slideInUp 0.6s ease forwards'
                },
                children: [
                    // Article structure from JSON
                    this.createArticleContent(articleData)
                ]
            }
        });

        // Insert at top for real-time feel
        this.container.insertBefore(articleElement, this.container.firstChild);
        
        // Auto-enhance new content
        this.enhanceNewArticle(articleElement);
    }

    enhanceNewArticle(element) {
        // Progressive enhancement on individual element
        this.app.enhance(element.querySelector('.like-btn'), (context) => ({
            onclick: (event) => this.handleLikeClick(event, context)
        }));
        
        this.app.enhance(element.querySelector('.share-btn'), (context) => ({
            onclick: (event) => this.handleShareClick(event, context)
        }));
    }

    updateExistingContent(updateData) {
        const { articleId, field, value } = updateData;
        
        // Update state
        this.app.setState(`articles.${articleId}.${field}`, value);
        
        // Find and update specific element
        const element = document.querySelector(`[data-article-id="${articleId}"]`);
        if (element) {
            this.updateElementField(element, field, value);
        }
    }

    createArticleContent(articleData) {
        return {
            div: {
                className: 'article-content',
                children: [
                    {
                        h2: {
                            className: 'article-title',
                            text: articleData.title
                        }
                    },
                    {
                        p: {
                            className: 'article-excerpt',
                            text: articleData.excerpt
                        }
                    },
                    {
                        div: {
                            className: 'article-actions',
                            children: [
                                {
                                    button: {
                                        className: 'like-btn',
                                        'data-article-id': articleData.id,
                                        text: `❤️ ${articleData.likes}`
                                    }
                                },
                                {
                                    button: {
                                        className: 'share-btn',
                                        'data-article-id': articleData.id,
                                        text: '🔗 Share'
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
    }

    handleLikeClick(event, context) {
        const { getState, setState } = context;
        const articleId = event.target.dataset.articleId;
        const liked = getState(`articles.${articleId}.liked`, false);
        
        setState(`articles.${articleId}.liked`, !liked);
        event.target.classList.toggle('liked', !liked);
    }

    handleShareClick(event, context) {
        const articleId = event.target.dataset.articleId;
        const articleData = context.getState(`articles.${articleId}`);
        
        if (navigator.share && articleData) {
            navigator.share({
                title: articleData.title,
                text: articleData.excerpt,
                url: window.location.href
            });
        }
    }
}

// Usage
const streamManager = new JSONStreamManager(app);
streamManager.connect('wss://api.example.com/stream', 'articlesContainer');
```

## Performance Optimization

Optimize JSON streaming for large datasets with batch rendering, virtual scrolling, and memory management techniques.

**Advanced Performance Optimization**

```javascript
// Performance Optimization for JSON Streaming

// 1. Batch Rendering for Multiple Items
class BatchRenderer {
    constructor(app, batchSize = 10) {
        this.app = app;
        this.batchSize = batchSize;
        this.pendingItems = [];
        this.renderTimer = null;
    }

    addItem(itemData) {
        this.pendingItems.push(itemData);
        
        if (this.pendingItems.length >= this.batchSize) {
            this.flushBatch();
        } else {
            this.scheduleRender();
        }
    }

    scheduleRender() {
        if (this.renderTimer) return;
        
        this.renderTimer = requestAnimationFrame(() => {
            this.flushBatch();
            this.renderTimer = null;
        });
    }

    flushBatch() {
        if (this.pendingItems.length === 0) return;

        const fragment = document.createDocumentFragment();
        
        this.pendingItems.forEach(item => {
            const element = this.app.domRenderer.render({
                // Render structure based on item type
                [item.type]: this.createElementStructure(item)
            });
            
            if (element) {
                fragment.appendChild(element);
            }
        });

        // Single DOM update for entire batch
        document.getElementById('container').appendChild(fragment);
        
        // Enhance entire batch
        this.enhanceBatch(this.pendingItems);
        
        this.pendingItems = [];
    }

    enhanceBatch(items) {
        // Use document.querySelectorAll for batch enhancement
        const elements = document.querySelectorAll('.newly-rendered');
        
        elements.forEach(element => {
            element.classList.remove('newly-rendered');
            this.app.enhance(element, this.getEnhancementConfig());
        });
    }

    createElementStructure(item) {
        return {
            className: 'item newly-rendered',
            'data-item-id': item.id,
            children: [
                {
                    h3: { text: item.title },
                    p: { text: item.description }
                }
            ]
        };
    }

    getEnhancementConfig() {
        return (context) => ({
            onclick: (event) => {
                const itemId = event.target.dataset.itemId;
                context.setState(`items.${itemId}.clicked`, true);
            }
        });
    }
}

// 2. Virtual Scrolling for Large Lists
class VirtualScrollRenderer {
    constructor(app, container, itemHeight = 200) {
        this.app = app;
        this.container = container;
        this.itemHeight = itemHeight;
        this.items = [];
        this.renderedItems = new Map();
        this.scrollTop = 0;
        
        this.setupScrollListener();
    }

    addItems(newItems) {
        this.items.push(...newItems);
        this.updateVisibleItems();
    }

    setupScrollListener() {
        this.container.addEventListener('scroll', () => {
            this.scrollTop = this.container.scrollTop;
            this.updateVisibleItems();
        });
    }

    updateVisibleItems() {
        const containerHeight = this.container.clientHeight;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / this.itemHeight) + 1,
            this.items.length
        );

        // Remove items outside viewport
        this.renderedItems.forEach((element, index) => {
            if (index < startIndex || index >= endIndex) {
                element.remove();
                this.renderedItems.delete(index);
            }
        });

        // Add items in viewport
        for (let i = startIndex; i < endIndex; i++) {
            if (!this.renderedItems.has(i)) {
                this.renderItem(i);
            }
        }
    }

    renderItem(index) {
        const item = this.items[index];
        const element = this.app.domRenderer.render({
            div: {
                className: 'virtual-item',
                style: {
                    position: 'absolute',
                    top: `${index * this.itemHeight}px`,
                    height: `${this.itemHeight}px`,
                    width: '100%'
                },
                children: [this.createItemContent(item)]
            }
        });

        this.container.appendChild(element);
        this.renderedItems.set(index, element);
        
        // Progressive enhancement
        this.app.enhance(element, this.getItemEnhancement(item));
    }

    createItemContent(item) {
        return {
            div: {
                className: 'item-content',
                children: [
                    { h4: { text: item.title } },
                    { p: { text: item.description } }
                ]
            }
        };
    }

    getItemEnhancement(item) {
        return (context) => ({
            onclick: () => {
                context.setState(`virtualItems.${item.id}.selected`, true);
            }
        });
    }
}

// 3. Memory Management for Long-Running Streams
class StreamMemoryManager {
    constructor(app, maxItems = 1000) {
        this.app = app;
        this.maxItems = maxItems;
        this.itemCount = 0;
    }

    addItem(element, data) {
        this.itemCount++;
        
        if (this.itemCount > this.maxItems) {
            this.removeOldestItems();
        }
        
        // Store reference for cleanup
        element.dataset.streamIndex = this.itemCount;
    }

    removeOldestItems() {
        const removeCount = Math.floor(this.maxItems * 0.1); // Remove 10%
        const elementsToRemove = document.querySelectorAll(
            `[data-stream-index]`
        );

        Array.from(elementsToRemove)
            .slice(0, removeCount)
            .forEach(element => {
                // Clean up any Juris enhancements
                this.cleanupElement(element);
                element.remove();
            });

        this.itemCount -= removeCount;
    }

    cleanupElement(element) {
        // Remove event listeners and state
        const elementId = element.dataset.articleId;
        if (elementId) {
            // Clear related state
            this.app.setState(`articles.${elementId}`, null);
        }
    }
}
```

## JSON Compression and Optimization

Reduce payload sizes further with compact JSON structures, delta updates, and intelligent compression strategies.

**JSON Compression Techniques**

```javascript
// JSON Compression and Optimization

// 1. Compact JSON Structure
const optimizedArticleStructure = {
    // Before: Verbose JSON (245 bytes)
    verbose: {
        "id": 12345,
        "title": "Revolutionary Object DOM Architecture",
        "excerpt": "The new Object DOM architecture enables...",
        "category": "technology",
        "publishDate": "2024-01-15",
        "readTime": 5,
        "likes": 142,
        "comments": 23,
        "image": "https://example.com/image.jpg"
    },

    // After: Compact JSON (186 bytes) - 24% smaller
    compact: {
        "i": 12345,
        "t": "Revolutionary Object DOM Architecture",
        "e": "The new Object DOM architecture enables...",
        "c": "tech",
        "d": "2024-01-15",
        "r": 5,
        "l": 142,
        "m": 23,
        "img": "https://example.com/image.jpg"
    }
};

// 2. JSON Expansion Function
function expandCompactArticle(compact) {
    return {
        id: compact.i,
        title: compact.t,
        excerpt: compact.e,
        category: compact.c === 'tech' ? 'technology' : compact.c,
        publishDate: compact.d,
        readTime: compact.r,
        likes: compact.l,
        comments: compact.m,
        image: compact.img
    };
}

// 3. Streaming with Compression
async function streamCompressedArticles() {
    const response = await fetch('/api/articles/stream?format=compact');
    const compactArticles = await response.json();
    
    compactArticles.forEach(compact => {
        // Expand compact JSON to full structure
        const article = expandCompactArticle(compact);
        
        // Render with full data
        renderArticle(article);
    });
}

// 4. Delta Updates for Real-Time
class DeltaUpdateManager {
    constructor(app) {
        this.app = app;
        this.articleCache = new Map();
    }

    handleUpdate(delta) {
        const { id, changes } = delta;
        
        // Get current article data
        let article = this.articleCache.get(id);
        if (!article) return;

        // Apply delta changes
        Object.assign(article, changes);
        
        // Update only changed fields in DOM
        this.updateArticleFields(id, changes);
        
        // Update cache
        this.articleCache.set(id, article);
    }

    updateArticleFields(articleId, changes) {
        const element = document.querySelector(`[data-article-id="${articleId}"]`);
        if (!element) return;

        Object.entries(changes).forEach(([field, value]) => {
            switch (field) {
                case 'likes':
                    const likeBtn = element.querySelector('.like-btn');
                    if (likeBtn) likeBtn.textContent = `❤️ ${value}`;
                    break;
                    
                case 'comments':
                    const commentBtn = element.querySelector('.comment-btn');
                    if (commentBtn) commentBtn.textContent = `💬 ${value}`;
                    break;
                    
                case 'title':
                    const titleEl = element.querySelector('.article-title');
                    if (titleEl) titleEl.textContent = value;
                    break;
            }
        });
    }
}

// Example delta update (only 45 bytes vs 245 bytes full article)
const deltaUpdate = {
    "id": 12345,
    "changes": {
        "likes": 143,
        "comments": 24
    }
};
```

## Complete Real-World Implementation

A complete production-ready JSON streaming application with all optimizations, error handling, and real-time features.

**Production JSON Streaming App**

```javascript
// Real-World JSON Streaming Implementation

class NewsStreamApp {
    constructor() {
        this.app = new Juris({
            renderMode: 'batch',
            components: {
                NewsArticle: this.createArticleComponent()
            }
        });
        
        this.batchRenderer = new BatchRenderer(this.app);
        this.memoryManager = new StreamMemoryManager(this.app, 500);
        this.performanceTracker = new PerformanceTracker();
        
        this.init();
    }

    async init() {
        // 1. Initialize container
        this.container = document.getElementById('articlesContainer');
        
        // 2. Start streaming
        await this.startStreaming();
        
        // 3. Setup real-time updates
        this.setupRealTimeUpdates();
        
        // 4. Enable progressive enhancement
        this.enableProgressiveEnhancement();
    }

    async startStreaming() {
        this.performanceTracker.startTimer('initial-stream');
        
        try {
            // Stream initial batch
            const response = await fetch('/api/articles/stream?limit=20&format=compact');
            const articles = await response.json();
            
            // Process in batches for better performance
            const batchSize = 5;
            for (let i = 0; i < articles.length; i += batchSize) {
                const batch = articles.slice(i, i + batchSize);
                await this.processBatch(batch);
                
                // Allow UI to update between batches
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
        } catch (error) {
            console.error('Streaming failed:', error);
            this.handleStreamingError(error);
        } finally {
            this.performanceTracker.endTimer('initial-stream');
        }
    }

    async processBatch(compactArticles) {
        const elements = [];
        
        compactArticles.forEach(compact => {
            // Expand compact JSON
            const article = this.expandArticle(compact);
            
            // Create element using Juris
            const element = this.app.domRenderer.render({
                article: {
                    className: 'article stream-item fade-in',
                    'data-article-id': article.id,
                    'data-category': article.category,
                    children: this.createArticleStructure(article)
                }
            });
            
            if (element) {
                elements.push({ element, data: article });
            }
        });

        // Batch DOM updates
        const fragment = document.createDocumentFragment();
        elements.forEach(({ element, data }) => {
            fragment.appendChild(element);
            this.memoryManager.addItem(element, data);
        });
        
        this.container.appendChild(fragment);
        
        // Progressive enhancement
        this.enhanceBatch(elements);
    }

    setupRealTimeUpdates() {
        const ws = new WebSocket('wss://api.example.com/updates');
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            
            switch (update.type) {
                case 'new_article':
                    this.handleNewArticle(update.data);
                    break;
                    
                case 'article_update':
                    this.handleArticleUpdate(update.data);
                    break;
                    
                case 'engagement_update':
                    this.handleEngagementUpdate(update.data);
                    break;
            }
        };
    }

    handleNewArticle(articleData) {
        // Render new article at top
        const element = this.app.domRenderer.render({
            article: {
                className: 'article new-arrival',
                'data-article-id': articleData.id,
                style: {
                    animation: 'slideInDown 0.6s ease forwards'
                },
                children: this.createArticleStructure(articleData)
            }
        });

        this.container.insertBefore(element, this.container.firstChild);
        this.enhanceNewElement(element);
    }

    enhanceBatch(elements) {
        elements.forEach(({ element }) => {
            this.enhanceElement(element);
        });
    }

    enhanceElement(element) {
        // Like button enhancement
        const likeBtn = element.querySelector('.like-btn');
        if (likeBtn) {
            this.app.enhance(likeBtn, (context) => ({
                onclick: (event) => this.handleLike(event, context)
            }));
        }

        // Category filter enhancement
        const categoryTag = element.querySelector('.category-tag');
        if (categoryTag) {
            this.app.enhance(categoryTag, (context) => ({
                onclick: (event) => this.handleCategoryFilter(event, context)
            }));
        }

        // Share button enhancement
        const shareBtn = element.querySelector('.share-btn');
        if (shareBtn) {
            this.app.enhance(shareBtn, (context) => ({
                onclick: (event) => this.handleShare(event, context)
            }));
        }
    }

    handleLike(event, context) {
        const { getState, setState } = context;
        const articleId = event.target.dataset.articleId;
        const currentLikes = parseInt(event.target.textContent.replace(/[^\d]/g, '')) || 0;
        const liked = getState(`articles.${articleId}.liked`, false);
        
        const newLiked = !liked;
        const newLikes = newLiked ? currentLikes + 1 : currentLikes - 1;
        
        // Update state
        setState(`articles.${articleId}.liked`, newLiked);
        setState(`articles.${articleId}.likes`, newLikes);
        
        // Update UI with animation
        event.target.style.transform = 'scale(1.2)';
        event.target.textContent = `❤️ ${newLikes}`;
        event.target.classList.toggle('liked', newLiked);
        
        setTimeout(() => {
            event.target.style.transform = 'scale(1)';
        }, 200);
        
        // Send to server (fire and forget)
        this.updateEngagement(articleId, 'like', newLiked);
    }

    async updateEngagement(articleId, type, value) {
        try {
            await fetch('/api/articles/engagement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, type, value })
            });
        } catch (error) {
            console.error('Failed to update engagement:', error);
        }
    }

    createArticleComponent() {
        return (props, context) => {
            const { articleData } = props;
            return {
                article: {
                    className: 'news-article',
                    'data-article-id': articleData.id,
                    children: this.createArticleStructure(articleData)
                }
            };
        };
    }

    createArticleStructure(article) {
        return [
            {
                h2: {
                    className: 'article-title',
                    text: article.title
                }
            },
            {
                p: {
                    className: 'article-excerpt',
                    text: article.excerpt
                }
            },
            {
                div: {
                    className: 'article-actions',
                    children: [
                        {
                            button: {
                                className: 'like-btn',
                                'data-article-id': article.id,
                                text: `❤️ ${article.likes}`
                            }
                        },
                        {
                            button: {
                                className: 'share-btn',
                                'data-article-id': article.id,
                                text: '🔗 Share'
                            }
                        }
                    ]
                }
            }
        ];
    }

    expandArticle(compact) {
        return {
            id: compact.i,
            title: compact.t,
            excerpt: compact.e,
            category: compact.c,
            likes: compact.l,
            comments: compact.m
        };
    }

    handleCategoryFilter(event, context) {
        const category = event.target.textContent.toLowerCase();
        context.setState('app.activeCategory', category);
    }

    handleShare(event, context) {
        const articleId = event.target.dataset.articleId;
        const articleData = context.getState(`articles.${articleId}`);
        
        if (navigator.share && articleData) {
            navigator.share({
                title: articleData.title,
                text: articleData.excerpt,
                url: window.location.href
            });
        }
    }
}

// Performance Tracker utility
class PerformanceTracker {
    constructor() {
        this.timers = new Map();
    }

    startTimer(name) {
        this.timers.set(name, performance.now());
    }

    endTimer(name) {
        const start = this.timers.get(name);
        if (start) {
            const duration = performance.now() - start;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            this.timers.delete(name);
            return duration;
        }
        return 0;
    }
}

// Initialize the application
const app = new NewsStreamApp();
```

## JSON Streaming Summary

**JSON Streaming with Juris represents the next evolution in web application architecture. By delivering pure data and rendering it directly with Object DOM, you achieve unprecedented performance while maintaining the flexibility to progressively enhance with full reactivity.**