/**
 * CloudCurio Frontend Application
 * 
 * This file handles all client-side functionality for the CloudCurio platform including:
 * - Navigation between sections
 * - Blog post management and display
 * - Knowledge base operations (add/search)
 * - AI chat interface with RAG
 * - Deep research tools
 * 
 * @version 1.0.0
 * @requires ES6+ browser support
 */

// Configuration and constants
const CONFIG = {
    DEBUG: true, // Set to false in production
    API_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
};

/**
 * Main application initialization
 * Runs when DOM is fully loaded
 * 
 * TODO: Add error tracking service integration (e.g., Sentry)
 * TODO: Add analytics tracking for user interactions
 * TODO: Implement offline mode with service workers
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Log application start
        logDebug('CloudCurio application initializing...');
        
        // Initialize all sections
        setupNavigation();
        setupBlogSection();
        setupKnowledgeBase();
        setupChat();
        setupResearch();
        
        // Load initial data
        loadBlogPosts();
        
        logDebug('CloudCurio application initialized successfully');
    } catch (error) {
        logError('Critical error during application initialization', error);
        showUserError('Application failed to load. Please refresh the page.');
    }
});

/**
 * Navigation System
 * 
 * Handles client-side routing between different sections of the application.
 * Uses CSS classes to show/hide sections without page reloads.
 * 
 * @function setupNavigation
 * 
 * IMPROVEMENTS NEEDED:
 * - Add browser history support (pushState/popState)
 * - Implement deep linking (allow direct navigation to sections via URL)
 * - Add loading states during section transitions
 * - Cache section content to avoid re-rendering
 * - Add keyboard shortcuts for power users (Alt+1, Alt+2, etc.)
 * 
 * PSEUDO CODE for History API integration:
 * ```
 * window.addEventListener('popstate', (e) => {
 *   if (e.state && e.state.section) {
 *     navigateToSection(e.state.section, false); // false = don't push to history again
 *   }
 * });
 * ```
 */
function setupNavigation() {
    try {
        logDebug('Setting up navigation system');
        
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('.section');
        
        // Validate that navigation elements exist
        if (navLinks.length === 0) {
            throw new Error('No navigation links found in DOM');
        }
        
        if (sections.length === 0) {
            throw new Error('No sections found in DOM');
        }

        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    
                    // Extract target section ID from href attribute
                    const targetId = link.getAttribute('href').substring(1);
                    logDebug(`Navigation clicked: ${targetId}`);
                    
                    // Validate target section exists
                    const targetSection = document.getElementById(targetId);
                    if (!targetSection) {
                        throw new Error(`Target section "${targetId}" not found`);
                    }

                    // Update active nav link styling
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');

                    // Show target section, hide others
                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === targetId) {
                            section.classList.add('active');
                            
                            // TODO: Add history.pushState for browser back button support
                            // history.pushState({ section: targetId }, '', `#${targetId}`);
                            
                            // TODO: Track analytics event
                            // trackEvent('navigation', 'section_view', targetId);
                        }
                    });
                    
                    logDebug(`Successfully navigated to: ${targetId}`);
                } catch (navError) {
                    logError('Error during navigation', navError);
                    showUserError('Navigation failed. Please try again.');
                }
            });
        });
        
        // TODO: Add support for keyboard navigation
        // document.addEventListener('keydown', (e) => {
        //   if (e.altKey && e.key >= '1' && e.key <= '5') {
        //     const index = parseInt(e.key) - 1;
        //     if (navLinks[index]) navLinks[index].click();
        //   }
        // });
        
        logDebug('Navigation system setup complete');
    } catch (error) {
        logError('Failed to setup navigation', error);
        throw error; // Re-throw to be caught by initialization
    }
}

/**
 * ============================================================================
 * BLOG SECTION - Post Management and Display
 * ============================================================================
 */

/**
 * Initialize blog section event listeners
 * 
 * @function setupBlogSection
 * 
 * IMPROVEMENTS NEEDED:
 * - Add pagination for large number of posts
 * - Implement post filtering by category/tags
 * - Add search functionality
 * - Implement post editing capabilities
 * - Add social sharing buttons
 */
function setupBlogSection() {
    try {
        logDebug('Setting up blog section');
        
        const refreshButton = document.getElementById('refresh-posts');
        const generateButton = document.getElementById('generate-post');
        
        // Validate elements exist
        if (!refreshButton) {
            throw new Error('Refresh posts button not found');
        }
        if (!generateButton) {
            throw new Error('Generate post button not found');
        }
        
        refreshButton.addEventListener('click', loadBlogPosts);
        generateButton.addEventListener('click', generateNewPost);
        
        logDebug('Blog section setup complete');
    } catch (error) {
        logError('Failed to setup blog section', error);
        // Non-critical error, log but don't throw
    }
}

/**
 * Load and display blog posts from the API
 * 
 * @async
 * @function loadBlogPosts
 * @returns {Promise<void>}
 * 
 * IMPROVEMENTS NEEDED:
 * - Add loading skeleton instead of plain text
 * - Implement infinite scroll or pagination
 * - Add post caching in localStorage
 * - Add sorting options (date, title, popularity)
 * - Implement optimistic UI updates
 * 
 * ERROR SCENARIOS HANDLED:
 * - Network failures
 * - Invalid JSON responses
 * - Empty result sets
 * - API errors (4xx, 5xx)
 */
async function loadBlogPosts() {
    const blogGrid = document.getElementById('blog-posts');
    
    try {
        logDebug('Loading blog posts');
        
        // Validate container exists
        if (!blogGrid) {
            throw new Error('Blog posts container not found');
        }
        
        // Show loading state with better UX
        blogGrid.innerHTML = '<p class="loading">Loading blog posts...</p>';
        
        // TODO: Check localStorage cache first
        // const cachedPosts = getCachedPosts();
        // if (cachedPosts && !isStale(cachedPosts)) {
        //   displayPosts(cachedPosts.data);
        //   return;
        // }
        
        // Fetch posts with timeout and retry logic
        const response = await fetchWithRetry('/api/blog/posts', {
            method: 'GET',
            timeout: CONFIG.API_TIMEOUT
        });
        
        // Validate response status
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Parse JSON response with error handling
        let posts;
        try {
            posts = await response.json();
        } catch (parseError) {
            logError('Failed to parse blog posts JSON', parseError);
            throw new Error('Invalid response format from server');
        }
        
        // Validate posts is an array
        if (!Array.isArray(posts)) {
            logError('Posts response is not an array', { posts });
            throw new Error('Invalid posts data structure');
        }

        // Handle empty results
        if (posts.length === 0) {
            blogGrid.innerHTML = `
                <div class="empty-state">
                    <p>No blog posts yet.</p>
                    <p>Click "Generate New Post" to create your first one!</p>
                </div>
            `;
            logDebug('No blog posts found');
            return;
        }
        
        // TODO: Cache the posts in localStorage
        // setCachedPosts(posts);

        // Render posts with error handling for each post
        blogGrid.innerHTML = posts.map((post, index) => {
            try {
                // Validate required post fields
                if (!post.id || !post.title) {
                    logError(`Invalid post data at index ${index}`, post);
                    return '<div class="blog-post error">Invalid post data</div>';
                }
                
                // Format date safely
                let formattedDate = 'Unknown date';
                try {
                    formattedDate = post.date ? new Date(post.date).toLocaleDateString() : 'Unknown date';
                } catch (dateError) {
                    logError(`Invalid date for post ${post.id}`, dateError);
                }
                
                return `
                    <div class="blog-post" data-post-id="${escapeHtml(post.id)}">
                        <h3>${escapeHtml(post.title)}</h3>
                        <div class="meta">
                            ${formattedDate} • ${escapeHtml(post.author || 'Anonymous')}
                        </div>
                        <div class="excerpt">${escapeHtml(post.excerpt || 'No excerpt available')}</div>
                        <button class="btn btn-primary" onclick="viewPost('${escapeHtml(post.id)}')">Read More</button>
                    </div>
                `;
            } catch (renderError) {
                logError(`Error rendering post at index ${index}`, renderError);
                return '<div class="blog-post error">Error rendering post</div>';
            }
        }).join('');
        
        logDebug(`Successfully loaded ${posts.length} blog posts`);
        
    } catch (error) {
        logError('Error loading blog posts', error);
        
        // Show user-friendly error message
        blogGrid.innerHTML = `
            <div class="error-state">
                <p>Error loading blog posts.</p>
                <p class="error-details">${escapeHtml(error.message)}</p>
                <button class="btn btn-primary" onclick="loadBlogPosts()">Try Again</button>
            </div>
        `;
        
        // TODO: Send error to tracking service
        // trackError('load_blog_posts_failed', error);
    }
}

/**
 * Generate a new blog post using AI
 * 
 * @async
 * @function generateNewPost
 * @returns {Promise<void>}
 * 
 * WORKFLOW:
 * 1. Disable button to prevent double-submission
 * 2. Call AI generation API
 * 3. Handle response and refresh post list
 * 4. Re-enable button
 * 
 * IMPROVEMENTS NEEDED:
 * - Add topic selection UI
 * - Show generation progress (streaming)
 * - Allow customization of tone/style
 * - Add post preview before publishing
 * - Implement draft saving
 * 
 * ERROR SCENARIOS:
 * - Network failures
 * - AI service unavailable
 * - Generation timeout
 * - Invalid response format
 */
async function generateNewPost() {
    const button = document.getElementById('generate-post');
    
    if (!button) {
        logError('Generate post button not found');
        return;
    }
    
    // Store original button state
    const originalText = button.textContent;
    const wasDisabled = button.disabled;
    
    try {
        logDebug('Starting blog post generation');
        
        // Disable button to prevent double-clicks
        button.disabled = true;
        button.textContent = 'Generating...';
        
        // TODO: Add loading animation
        // button.classList.add('loading');
        
        // Call API with retry logic
        const response = await fetchWithRetry('/api/blog/generate', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 seconds for AI generation
        });
        
        // Validate response
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse result
        let result;
        try {
            result = await response.json();
        } catch (parseError) {
            logError('Failed to parse generation response', parseError);
            throw new Error('Invalid response from server');
        }
        
        // Check success status
        if (result.success) {
            logDebug('Blog post generated successfully', { postId: result.postId });
            
            // Show success message
            // TODO: Replace alert with toast notification
            alert(`Success! Generated post: "${result.title}"`);
            
            // Reload posts to show new one
            await loadBlogPosts();
            
            // TODO: Scroll to new post
            // const newPost = document.querySelector(`[data-post-id="${result.postId}"]`);
            // if (newPost) newPost.scrollIntoView({ behavior: 'smooth' });
            
        } else {
            // Server returned error in result
            const errorMsg = result.error || 'Unknown error occurred';
            logError('Blog generation failed', new Error(errorMsg));
            throw new Error(errorMsg);
        }
        
    } catch (error) {
        logError('Error generating blog post', error);
        
        // Show user-friendly error
        let userMessage = 'Failed to generate post. ';
        
        if (error.name === 'AbortError') {
            userMessage += 'Request timed out. Please try again.';
        } else if (error.message.includes('HTTP 5')) {
            userMessage += 'Server error. Please try again later.';
        } else if (error.message.includes('HTTP 4')) {
            userMessage += 'Invalid request. Please refresh and try again.';
        } else {
            userMessage += error.message;
        }
        
        alert(userMessage);
        
        // TODO: Track error
        // trackError('generate_post_failed', error);
        
    } finally {
        // Always restore button state
        button.disabled = wasDisabled;
        button.textContent = originalText;
        // button.classList.remove('loading');
    }
}

/**
 * View full blog post content
 * 
 * @async
 * @function viewPost
 * @param {string} postId - ID of post to view
 * @returns {Promise<void>}
 * 
 * IMPROVEMENTS NEEDED:
 * - Replace alert with proper modal dialog
 * - Add markdown rendering support
 * - Add syntax highlighting for code blocks
 * - Add sharing functionality
 * - Add print/export options
 * - Track post views for analytics
 * 
 * PSEUDO CODE for modal implementation:
 * ```
 * const modal = createModal({
 *   title: post.title,
 *   content: renderMarkdown(post.content),
 *   footer: [
 *     { label: 'Share', onClick: () => sharePost(post) },
 *     { label: 'Close', onClick: () => modal.close() }
 *   ]
 * });
 * modal.show();
 * ```
 */
async function viewPost(postId) {
    try {
        logDebug(`Viewing post: ${postId}`);
        
        // Validate postId
        if (!postId || typeof postId !== 'string') {
            throw new Error('Invalid post ID');
        }
        
        // TODO: Show loading state
        // showLoadingModal();
        
        // Fetch post details
        const response = await fetchWithRetry(`/api/blog/post/${encodeURIComponent(postId)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Post not found');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const post = await response.json();
        
        // Validate post data
        if (!post || !post.title || !post.content) {
            throw new Error('Invalid post data received');
        }
        
        logDebug('Post loaded successfully', { title: post.title });
        
        // TODO: Replace with proper modal
        // For now, use alert (simple modal display)
        alert(`${post.title}\n\n${post.content}`);
        
        // TODO: Track view
        // trackEvent('blog', 'post_view', postId);
        
    } catch (error) {
        logError(`Error viewing post ${postId}`, error);
        alert(`Error loading post: ${error.message}`);
    }
}

/**
 * ============================================================================
 * KNOWLEDGE BASE SECTION - Content Management and Search
 * ============================================================================
 */

/**
 * Initialize knowledge base section
 * 
 * @function setupKnowledgeBase
 * 
 * IMPROVEMENTS NEEDED:
 * - Add bulk import from files (PDF, DOCX, TXT)
 * - Implement tagging/categorization system
 * - Add knowledge graph visualization
 * - Implement version control for entries
 * - Add collaborative editing
 */
function setupKnowledgeBase() {
    try {
        logDebug('Setting up knowledge base section');
        
        const addButton = document.getElementById('add-to-kb');
        const searchButton = document.getElementById('search-kb');
        
        if (!addButton) throw new Error('Add to KB button not found');
        if (!searchButton) throw new Error('Search KB button not found');
        
        addButton.addEventListener('click', addToKnowledgeBase);
        searchButton.addEventListener('click', searchKnowledgeBase);
        
        // TODO: Add Enter key support for search input
        // const searchInput = document.getElementById('kb-search-query');
        // searchInput.addEventListener('keypress', (e) => {
        //   if (e.key === 'Enter') searchKnowledgeBase();
        // });
        
        logDebug('Knowledge base section setup complete');
    } catch (error) {
        logError('Failed to setup knowledge base section', error);
    }
}

/**
 * Add content to knowledge base with automatic vectorization
 * 
 * @async
 * @function addToKnowledgeBase
 * @returns {Promise<void>}
 * 
 * WORKFLOW:
 * 1. Validate input fields
 * 2. Send to API for storage and vectorization
 * 3. Clear form on success
 * 4. Provide user feedback
 * 
 * BACKEND PROCESS:
 * - Content stored in D1 database
 * - Embeddings generated using BGE model (768 dimensions)
 * - Vector stored in Vectorize for semantic search
 * 
 * IMPROVEMENTS NEEDED:
 * - Add rich text editor for content
 * - Support file uploads (PDF, DOCX parsing)
 * - Add metadata fields (tags, category, source URL)
 * - Show upload progress for large content
 * - Add content preview before submission
 * - Implement draft saving
 * 
 * ERROR SCENARIOS:
 * - Empty fields
 * - Content too large
 * - Vectorization failure
 * - Network errors
 */
async function addToKnowledgeBase() {
    try {
        logDebug('Adding content to knowledge base');
        
        // Get form elements
        const contentInput = document.getElementById('kb-content');
        const titleInput = document.getElementById('kb-title');
        
        if (!contentInput || !titleInput) {
            throw new Error('Knowledge base form elements not found');
        }
        
        // Get and validate input values
        const content = contentInput.value.trim();
        const title = titleInput.value.trim();

        // Validation
        if (!content || !title) {
            showUserError('Please enter both title and content.');
            return;
        }
        
        // TODO: Add content length validation
        // if (content.length > MAX_CONTENT_LENGTH) {
        //   showUserError(`Content too long. Maximum ${MAX_CONTENT_LENGTH} characters.`);
        //   return;
        // }
        
        // TODO: Add profanity/content filtering
        // if (containsProfanity(content) || containsProfanity(title)) {
        //   showUserError('Content contains inappropriate language.');
        //   return;
        // }
        
        logDebug('Submitting to knowledge base API', { 
            titleLength: title.length, 
            contentLength: content.length 
        });
        
        // Disable form during submission
        const addButton = document.getElementById('add-to-kb');
        const originalText = addButton.textContent;
        addButton.disabled = true;
        addButton.textContent = 'Adding...';

        try {
            // Submit to API
            const response = await fetchWithRetry('/api/knowledge/add', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content }),
                timeout: 30000 // 30 seconds for vectorization
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                logDebug('Successfully added to knowledge base', { id: result.id });
                
                // Success feedback
                alert('Added to knowledge base successfully!');
                
                // Clear form
                contentInput.value = '';
                titleInput.value = '';
                
                // TODO: Show success toast instead of alert
                // showToast('Success', 'Content added to knowledge base', 'success');
                
                // TODO: Update KB statistics
                // updateKBStats();
                
            } else {
                throw new Error(result.error || 'Failed to add content');
            }
            
        } finally {
            // Re-enable form
            addButton.disabled = false;
            addButton.textContent = originalText;
        }
        
    } catch (error) {
        logError('Error adding to knowledge base', error);
        
        let userMessage = 'Error adding to knowledge base. ';
        
        if (error.name === 'AbortError') {
            userMessage += 'Request timed out. Content may be too large.';
        } else {
            userMessage += error.message;
        }
        
        showUserError(userMessage);
        
        // TODO: Track error
        // trackError('kb_add_failed', error);
    }
}

/**
 * Search knowledge base using semantic vector search
 * 
 * @async
 * @function searchKnowledgeBase
 * @returns {Promise<void>}
 * 
 * WORKFLOW:
 * 1. Get search query
 * 2. Query is converted to embedding on backend
 * 3. Vector similarity search in Vectorize
 * 4. Results ranked by relevance score
 * 5. Display results with highlighting
 * 
 * SEMANTIC SEARCH:
 * - Finds conceptually similar content, not just keyword matches
 * - Uses cosine similarity on 768-dimensional vectors
 * - Returns top K most relevant results (default: 5)
 * 
 * IMPROVEMENTS NEEDED:
 * - Add search filters (date range, category, tags)
 * - Implement search history and suggestions
 * - Add "More like this" for each result
 * - Highlight matching terms in results
 * - Add pagination for results
 * - Save favorite searches
 * - Export search results
 * 
 * PSEUDO CODE for advanced search:
 * ```
 * const filters = {
 *   dateRange: { from: '2024-01-01', to: '2024-12-31' },
 *   categories: ['tech', 'ai'],
 *   minScore: 0.7,
 *   sortBy: 'relevance' // or 'date'
 * };
 * ```
 */
async function searchKnowledgeBase() {
    const resultsDiv = document.getElementById('kb-results');
    
    try {
        logDebug('Searching knowledge base');
        
        // Validate results container exists
        if (!resultsDiv) {
            throw new Error('Knowledge base results container not found');
        }
        
        // Get search query
        const queryInput = document.getElementById('kb-search-query');
        if (!queryInput) {
            throw new Error('Search query input not found');
        }
        
        const query = queryInput.value.trim();

        // Validate query
        if (!query) {
            showUserError('Please enter a search query.');
            return;
        }
        
        // TODO: Minimum query length validation
        // if (query.length < 3) {
        //   showUserError('Search query must be at least 3 characters.');
        //   return;
        // }
        
        logDebug('Executing search', { query, length: query.length });

        // Show loading state
        resultsDiv.innerHTML = '<p class="loading">Searching knowledge base...</p>';
        
        // TODO: Add search suggestions dropdown
        // showSearchSuggestions(query);

        // Perform search with timeout
        const response = await fetchWithRetry(
            `/api/knowledge/search?q=${encodeURIComponent(query)}`,
            { timeout: 15000 } // 15 seconds
        );
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const results = await response.json();
        
        // Validate results is array
        if (!Array.isArray(results)) {
            logError('Search results not an array', { results });
            throw new Error('Invalid search results format');
        }

        logDebug(`Search returned ${results.length} results`);

        // Handle no results
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <p>No results found for "${escapeHtml(query)}"</p>
                    <p>Try different keywords or add more content to your knowledge base.</p>
                </div>
            `;
            return;
        }

        // Render results
        resultsDiv.innerHTML = results.map((result, index) => {
            try {
                // Validate result structure
                if (!result.title || !result.content) {
                    logError(`Invalid result at index ${index}`, result);
                    return '<div class="result-item error">Invalid result data</div>';
                }
                
                // Calculate relevance percentage
                const relevancePercent = (result.score * 100).toFixed(1);
                
                // Truncate content for preview
                const contentPreview = result.content.substring(0, 200);
                
                // TODO: Add query term highlighting
                // const highlightedContent = highlightTerms(contentPreview, query);
                
                return `
                    <div class="result-item" data-result-id="${escapeHtml(result.id)}">
                        <h4>${escapeHtml(result.title)}</h4>
                        <p>${escapeHtml(contentPreview)}...</p>
                        <div class="result-meta">
                            <small class="relevance">Relevance: ${relevancePercent}%</small>
                            <button class="btn btn-small" onclick="viewKBEntry('${escapeHtml(result.id)}')">
                                View Full Content
                            </button>
                        </div>
                    </div>
                `;
            } catch (renderError) {
                logError(`Error rendering result ${index}`, renderError);
                return '<div class="result-item error">Error displaying result</div>';
            }
        }).join('');
        
        // TODO: Track search analytics
        // trackEvent('kb_search', 'search_performed', {
        //   query,
        //   resultCount: results.length,
        //   topScore: results[0]?.score
        // });
        
    } catch (error) {
        logError('Error searching knowledge base', error);
        
        resultsDiv.innerHTML = `
            <div class="error-state">
                <p>Error searching knowledge base.</p>
                <p class="error-details">${escapeHtml(error.message)}</p>
                <button class="btn btn-primary" onclick="searchKnowledgeBase()">Try Again</button>
            </div>
        `;
        
        // TODO: Track error
        // trackError('kb_search_failed', error);
    }
}

/**
 * View full knowledge base entry
 * 
 * @async
 * @function viewKBEntry
 * @param {string} entryId - ID of KB entry to view
 * 
 * TODO: Implement this function
 * TODO: Add modal dialog for full content display
 * TODO: Add edit/delete capabilities
 * TODO: Show related entries
 */
async function viewKBEntry(entryId) {
    logDebug(`View KB entry: ${entryId}`);
    showUserError('View full entry feature coming soon!');
    
    // PSEUDO CODE:
    // const entry = await fetchKBEntry(entryId);
    // showModal({
    //   title: entry.title,
    //   content: entry.content,
    //   actions: [
    //     { label: 'Edit', onClick: () => editKBEntry(entryId) },
    //     { label: 'Delete', onClick: () => deleteKBEntry(entryId) },
    //     { label: 'Find Similar', onClick: () => findSimilarEntries(entryId) }
    //   ]
    // });
}

/**
 * ============================================================================
 * AI CHAT SECTION - RAG-Enabled Chatbot Interface
 * ============================================================================
 */

/**
 * Initialize chat section
 * 
 * @function setupChat
 * 
 * FEATURES:
 * - Real-time AI responses
 * - RAG (Retrieval Augmented Generation)
 * - Automatic context from knowledge base
 * 
 * IMPROVEMENTS NEEDED:
 * - Add conversation history persistence
 * - Implement chat sessions
 * - Add typing indicators
 * - Support file uploads in chat
 * - Add voice input/output
 * - Implement chat export
 * - Add message reactions
 * - Support markdown in messages
 */
function setupChat() {
    try {
        logDebug('Setting up chat section');
        
        const sendButton = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');
        
        if (!sendButton) throw new Error('Send message button not found');
        if (!chatInput) throw new Error('Chat input not found');

        sendButton.addEventListener('click', sendMessage);
        
        // Enter key to send message
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent newline
                sendMessage();
            }
            // TODO: Shift+Enter for newline in textarea
        });
        
        // TODO: Add typing indicator
        // chatInput.addEventListener('input', () => {
        //   showTypingIndicator();
        // });
        
        logDebug('Chat section setup complete');
    } catch (error) {
        logError('Failed to setup chat section', error);
    }
}

/**
 * Send message to AI chatbot with RAG
 * 
 * @async
 * @function sendMessage
 * @returns {Promise<void>}
 * 
 * RAG WORKFLOW:
 * 1. User sends message
 * 2. Backend converts message to embedding
 * 3. Semantic search in knowledge base for relevant context
 * 4. Context + message sent to LLM
 * 5. AI generates informed response
 * 
 * This reduces hallucinations and provides accurate, source-backed answers.
 * 
 * IMPROVEMENTS NEEDED:
 * - Add message streaming for real-time responses
 * - Show sources used for RAG context
 * - Add "regenerate response" option
 * - Implement conversation branching
 * - Add suggested follow-up questions
 * - Support multi-turn conversations
 * - Add message editing
 * - Implement @mentions for specific topics
 * 
 * ERROR SCENARIOS:
 * - Empty message
 * - Network failures
 * - AI service unavailable
 * - Response timeout
 * - Invalid response format
 */
async function sendMessage() {
    try {
        logDebug('Sending chat message');
        
        const input = document.getElementById('chat-input');
        const messagesDiv = document.getElementById('chat-messages');
        
        if (!input || !messagesDiv) {
            throw new Error('Chat elements not found');
        }
        
        // Get and validate message
        const message = input.value.trim();

        if (!message) {
            logDebug('Empty message, ignoring');
            return;
        }
        
        // TODO: Message length validation
        // if (message.length > MAX_MESSAGE_LENGTH) {
        //   showUserError(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`);
        //   return;
        // }
        
        logDebug('Message to send', { length: message.length });
        
        // Add user message to chat UI
        addMessageToChat('user', message);
        input.value = '';
        
        // Resize textarea if needed
        input.style.height = 'auto';
        
        // Add loading indicator
        const loadingId = Date.now();
        addMessageToChat('system', 'AI is thinking...', loadingId);
        
        // TODO: Add typing animation
        // const typingIndicator = showTypingIndicator();

        try {
            // Send to AI chat API with RAG
            const response = await fetchWithRetry('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message }),
                timeout: 60000 // 60 seconds for AI response
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            // Remove loading message
            const loadingMsg = document.getElementById(`msg-${loadingId}`);
            if (loadingMsg) {
                loadingMsg.remove();
            }
            
            // Validate response
            if (!result.response) {
                throw new Error('No response from AI');
            }
            
            logDebug('Received AI response', { 
                length: result.response.length 
            });
            
            // Add AI response to chat
            addMessageToChat('assistant', result.response);
            
            // TODO: Add sources/references if available
            // if (result.sources) {
            //   addMessageToChat('system', 'Sources: ' + result.sources.join(', '));
            // }
            
            // Auto-scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // TODO: Save conversation to history
            // saveChatMessage({ role: 'user', content: message });
            // saveChatMessage({ role: 'assistant', content: result.response });
            
            // TODO: Track chat analytics
            // trackEvent('chat', 'message_sent', {
            //   messageLength: message.length,
            //   responseLength: result.response.length,
            //   hasRAGContext: !!result.sources
            // });
            
        } catch (apiError) {
            // Remove loading message
            const loadingMsg = document.getElementById(`msg-${loadingId}`);
            if (loadingMsg) {
                loadingMsg.remove();
            }
            
            // Show error in chat
            let errorMessage = 'Error: Could not get response from AI. ';
            
            if (apiError.name === 'AbortError') {
                errorMessage += 'Request timed out.';
            } else if (apiError.message.includes('HTTP 5')) {
                errorMessage += 'AI service temporarily unavailable.';
            } else {
                errorMessage += apiError.message;
            }
            
            addMessageToChat('system', errorMessage);
            
            logError('Chat API error', apiError);
            
            // TODO: Track error
            // trackError('chat_message_failed', apiError);
        }
        
    } catch (error) {
        logError('Error in sendMessage', error);
        showUserError('Failed to send message. Please try again.');
    }
}

/**
 * Add message to chat interface
 * 
 * @function addMessageToChat
 * @param {string} type - Message type: 'user', 'assistant', or 'system'
 * @param {string} content - Message content
 * @param {number} [id] - Optional message ID for reference
 * 
 * MESSAGE TYPES:
 * - user: User's message (aligned right, blue background)
 * - assistant: AI response (aligned left, gray background)
 * - system: System messages (centered, yellow background)
 * 
 * IMPROVEMENTS NEEDED:
 * - Add markdown rendering
 * - Support code syntax highlighting
 * - Add copy button for messages
 * - Support inline images/links
 * - Add message timestamps
 * - Add avatar images
 * - Implement message reactions (👍👎)
 * 
 * PSEUDO CODE for rich message rendering:
 * ```
 * const messageEl = document.createElement('div');
 * messageEl.className = `message ${type}`;
 * messageEl.innerHTML = `
 *   <div class="avatar">${getAvatar(type)}</div>
 *   <div class="content">
 *     ${renderMarkdown(content)}
 *     <div class="timestamp">${formatTime(new Date())}</div>
 *     <div class="actions">
 *       <button onclick="copyMessage()">Copy</button>
 *       <button onclick="reactToMessage()">👍</button>
 *     </div>
 *   </div>
 * `;
 * ```
 */
function addMessageToChat(type, content, id = null) {
    try {
        const messagesDiv = document.getElementById('chat-messages');
        
        if (!messagesDiv) {
            throw new Error('Chat messages container not found');
        }
        
        // Validate type
        const validTypes = ['user', 'assistant', 'system'];
        if (!validTypes.includes(type)) {
            logError('Invalid message type', { type });
            type = 'system';
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        if (id) {
            messageDiv.id = `msg-${id}`;
        }
        
        // Sanitize content to prevent XSS
        messageDiv.textContent = content;
        
        // TODO: Replace textContent with rendered markdown
        // messageDiv.innerHTML = renderMarkdown(escapeHtml(content));
        
        // Add to chat
        messagesDiv.appendChild(messageDiv);
        
        // Auto-scroll to latest message
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        logDebug(`Added ${type} message to chat`, { id, contentLength: content.length });
        
    } catch (error) {
        logError('Error adding message to chat', error);
    }
}

/**
 * ============================================================================
 * RESEARCH TOOLS SECTION - Multi-Agent Deep Research
 * ============================================================================
 */

/**
 * Initialize research tools section
 * 
 * @function setupResearch
 * 
 * FEATURES:
 * - Multiple research types (comprehensive, quick, comparison, deep-dive)
 * - Multi-agent AI collaboration
 * - Structured research reports
 * - Source attribution
 * 
 * IMPROVEMENTS NEEDED:
 * - Add research templates
 * - Implement progress tracking
 * - Add research history
 * - Support collaborative research
 * - Add citation management
 * - Export to various formats (PDF, DOCX, MD)
 */
function setupResearch() {
    try {
        logDebug('Setting up research tools section');
        
        const startButton = document.getElementById('start-research');
        
        if (!startButton) {
            throw new Error('Start research button not found');
        }
        
        startButton.addEventListener('click', startResearch);
        
        // TODO: Add research history sidebar
        // loadResearchHistory();
        
        logDebug('Research tools section setup complete');
    } catch (error) {
        logError('Failed to setup research tools section', error);
    }
}

/**
 * Start a deep research task with multi-agent AI
 * 
 * @async
 * @function startResearch
 * @returns {Promise<void>}
 * 
 * RESEARCH PROCESS:
 * 1. User submits research query and type
 * 2. Backend spawns multiple AI agents
 * 3. Agents perform phased research:
 *    - Phase 1: Initial exploration and data gathering
 *    - Phase 2: Critical analysis and evaluation
 *    - Phase 3: Synthesis and conclusion
 * 4. Results combined into structured report
 * 5. Citations and sources included
 * 
 * RESEARCH TYPES:
 * - comprehensive: Full multi-perspective analysis (longest)
 * - quick: Concise summary of key points (fastest)
 * - comparison: Systematic comparison of options
 * - deep-dive: In-depth technical analysis
 * 
 * IMPROVEMENTS NEEDED:
 * - Add real-time progress updates
 * - Show individual agent findings
 * - Allow human-in-the-loop refinement
 * - Add fact-checking layer
 * - Implement source verification
 * - Add interactive visualization of findings
 * - Support multi-language research
 * - Add bias detection
 * 
 * ERROR SCENARIOS:
 * - Empty query
 * - Research timeout (for very complex queries)
 * - AI service unavailable
 * - Network failures
 * - Invalid response format
 * 
 * PSEUDO CODE for progress tracking:
 * ```
 * const researchId = startResearch(query, type);
 * const progressInterval = setInterval(async () => {
 *   const status = await checkResearchProgress(researchId);
 *   updateProgressBar(status.percentComplete);
 *   showCurrentPhase(status.phase);
 *   if (status.complete) {
 *     clearInterval(progressInterval);
 *     displayResults(status.results);
 *   }
 * }, 2000);
 * ```
 */
async function startResearch() {
    const outputDiv = document.getElementById('research-output');
    
    try {
        logDebug('Starting research task');
        
        // Validate elements exist
        if (!outputDiv) {
            throw new Error('Research output container not found');
        }
        
        const queryInput = document.getElementById('research-query');
        const typeSelect = document.getElementById('research-type');
        const button = document.getElementById('start-research');
        
        if (!queryInput || !typeSelect || !button) {
            throw new Error('Research form elements not found');
        }
        
        // Get and validate input
        const query = queryInput.value.trim();
        const type = typeSelect.value;

        if (!query) {
            showUserError('Please enter a research query.');
            return;
        }
        
        // TODO: Validate query length
        // if (query.length < 10) {
        //   showUserError('Research query too short. Please provide more details.');
        //   return;
        // }
        
        logDebug('Research parameters', { query, type, queryLength: query.length });
        
        // Disable button and show loading state
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Researching...';
        
        // Show loading message with research type info
        outputDiv.innerHTML = `
            <div class="research-loading">
                <p>AI agents are working on your ${type} research...</p>
                <p class="research-info">This may take 30-60 seconds.</p>
                <div class="loading-spinner"></div>
            </div>
        `;
        
        // TODO: Add progress indicators
        // showResearchProgress(outputDiv, type);

        try {
            // Call research API with extended timeout
            const response = await fetchWithRetry('/api/research', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, type }),
                timeout: 90000 // 90 seconds for complex research
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            logDebug('Research completed', { 
                success: result.success,
                titleLength: result.title?.length,
                contentLength: result.content?.length,
                sourceCount: result.sources?.length
            });
            
            // Validate and display results
            if (result.success) {
                if (!result.title || !result.content) {
                    throw new Error('Incomplete research results received');
                }
                
                // Format and display research report
                outputDiv.innerHTML = `
                    <div class="research-result">
                        <div class="research-header">
                            <h4>${escapeHtml(result.title)}</h4>
                            <span class="research-type-badge">${escapeHtml(type)}</span>
                        </div>
                        <div class="research-content">
                            ${escapeHtml(result.content).replace(/\n/g, '<br>')}
                        </div>
                        ${result.sources && result.sources.length > 0 ? `
                            <div class="research-sources">
                                <h5>Research Sources:</h5>
                                <ul>
                                    ${result.sources.map(source => 
                                        `<li>${escapeHtml(source)}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="research-actions">
                            <button class="btn btn-secondary" onclick="exportResearch()">
                                Export Report
                            </button>
                            <button class="btn btn-secondary" onclick="saveResearch()">
                                Save to Knowledge Base
                            </button>
                        </div>
                    </div>
                `;
                
                // TODO: Auto-save research to history
                // saveResearchToHistory({ query, type, result, timestamp: new Date() });
                
                // TODO: Track research analytics
                // trackEvent('research', 'completed', {
                //   type,
                //   queryLength: query.length,
                //   resultLength: result.content.length,
                //   duration: Date.now() - startTime
                // });
                
            } else {
                // Research failed on backend
                throw new Error(result.error || 'Research failed without error message');
            }
            
        } finally {
            // Always restore button state
            button.disabled = false;
            button.textContent = originalText;
        }
        
    } catch (error) {
        logError('Error running research', error);
        
        // Display error message
        let userMessage = 'Research failed. ';
        
        if (error.name === 'AbortError') {
            userMessage += 'Request timed out. Query may be too complex. Try a simpler query or "quick" research type.';
        } else if (error.message.includes('HTTP 5')) {
            userMessage += 'AI research service temporarily unavailable. Please try again later.';
        } else {
            userMessage += error.message;
        }
        
        outputDiv.innerHTML = `
            <div class="error-state">
                <h4>Research Failed</h4>
                <p>${escapeHtml(userMessage)}</p>
                <button class="btn btn-primary" onclick="startResearch()">Try Again</button>
            </div>
        `;
        
        // TODO: Track error
        // trackError('research_failed', error, { query, type });
        
        // Reset button state
        const button = document.getElementById('start-research');
        if (button) {
            button.disabled = false;
            button.textContent = 'Start Research';
        }
    }
}

/**
 * Export research report
 * 
 * @function exportResearch
 * 
 * TODO: Implement research export functionality
 * - Export as PDF
 * - Export as Markdown
 * - Export as Word document
 * - Include metadata and timestamp
 */
function exportResearch() {
    logDebug('Export research requested');
    showUserError('Export feature coming soon!');
    
    // PSEUDO CODE:
    // const researchContent = getCurrentResearch();
    // const exportFormat = promptUserForFormat(); // 'pdf', 'md', 'docx'
    // 
    // switch(exportFormat) {
    //   case 'pdf':
    //     exportToPDF(researchContent);
    //     break;
    //   case 'md':
    //     downloadMarkdown(researchContent);
    //     break;
    //   case 'docx':
    //     exportToWord(researchContent);
    //     break;
    // }
}

/**
 * Save research report to knowledge base
 * 
 * @async
 * @function saveResearch
 * 
 * TODO: Implement save to knowledge base
 * - Extract title and content from current research
 * - Add to knowledge base with vectorization
 * - Show success confirmation
 */
async function saveResearch() {
    logDebug('Save research to KB requested');
    showUserError('Save to knowledge base feature coming soon!');
    
    // PSEUDO CODE:
    // const research = getCurrentResearch();
    // const title = `Research: ${research.query}`;
    // const content = `${research.content}\n\nSources: ${research.sources.join(', ')}`;
    // 
    // await fetch('/api/knowledge/add', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ title, content })
    // });
    // 
    // showToast('Research saved to knowledge base!');
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS AND HELPERS
 * ============================================================================
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * 
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML insertion
 * 
 * SECURITY: Critical function for preventing XSS vulnerabilities
 * Always use this when inserting user-generated content into HTML
 * 
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
function escapeHtml(text) {
    // Validate input
    if (text === null || text === undefined) {
        logDebug('escapeHtml called with null/undefined, returning empty string');
        return '';
    }
    
    // Convert to string if not already
    const str = String(text);
    
    // Character mapping for HTML entities
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Debug logging function
 * Only logs when CONFIG.DEBUG is true
 * 
 * @param {string} message - Log message
 * @param {*} [data] - Optional data to log
 * 
 * TODO: Integrate with proper logging service (e.g., LogRocket, Datadog)
 * TODO: Add log levels (debug, info, warn, error)
 * TODO: Add timestamps to all logs
 */
function logDebug(message, data = null) {
    if (CONFIG.DEBUG) {
        const timestamp = new Date().toISOString();
        if (data) {
            console.log(`[${timestamp}] [DEBUG] ${message}`, data);
        } else {
            console.log(`[${timestamp}] [DEBUG] ${message}`);
        }
    }
}

/**
 * Error logging function
 * Always logs errors with stack traces
 * 
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * 
 * IMPROVEMENTS NEEDED:
 * - Send to error tracking service (Sentry, Rollbar)
 * - Include user context and session info
 * - Add error fingerprinting for grouping
 * - Capture browser/environment details
 */
function logError(message, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`, {
        error: error,
        message: error?.message,
        stack: error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
    });
    
    // TODO: Send to error tracking service
    // if (window.Sentry) {
    //   Sentry.captureException(error, {
    //     tags: { component: 'frontend' },
    //     extra: { message, timestamp }
    //   });
    // }
}

/**
 * Show user-friendly error message
 * 
 * @param {string} message - User-friendly error message
 * 
 * TODO: Replace alert() with toast notifications or modal
 * TODO: Add error recovery suggestions
 * TODO: Add contact support button for critical errors
 */
function showUserError(message) {
    // TODO: Replace with better UI component
    alert(`Error: ${message}`);
    
    // PSEUDO CODE for toast notification:
    // const toast = createToast({
    //   type: 'error',
    //   message: message,
    //   duration: 5000,
    //   action: {
    //     label: 'Report',
    //     onClick: () => reportError(message)
    //   }
    // });
    // toast.show();
}

/**
 * Fetch with retry logic and timeout
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} [options.timeout] - Request timeout in ms
 * @param {number} [options.retries] - Number of retry attempts
 * @returns {Promise<Response>} Fetch response
 * 
 * FEATURES:
 * - Automatic retry on failure with exponential backoff
 * - Request timeout with AbortController
 * - Detailed error logging
 * 
 * IMPROVEMENTS NEEDED:
 * - Add request caching
 * - Add request deduplication
 * - Add offline queue for failed requests
 * - Add progress tracking for large uploads
 */
async function fetchWithRetry(url, options = {}) {
    const timeout = options.timeout || CONFIG.API_TIMEOUT;
    const maxRetries = options.retries || CONFIG.RETRY_ATTEMPTS;
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            logDebug(`Fetch attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            // Merge options with abort signal
            const fetchOptions = {
                ...options,
                signal: controller.signal
            };
            
            // Perform fetch
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
            
            logDebug(`Fetch successful for ${url}`, { status: response.status });
            return response;
            
        } catch (error) {
            lastError = error;
            
            // Check if it's an abort (timeout)
            if (error.name === 'AbortError') {
                logError(`Request timeout after ${timeout}ms for ${url}`, error);
            } else {
                logError(`Fetch attempt ${attempt + 1} failed for ${url}`, error);
            }
            
            // Don't retry on last attempt
            if (attempt < maxRetries) {
                // Exponential backoff
                const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt);
                logDebug(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    // All retries exhausted
    logError(`All ${maxRetries + 1} fetch attempts failed for ${url}`, lastError);
    throw lastError;
}

/**
 * Validate email address format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 * 
 * TODO: Add server-side validation as well
 * TODO: Check for disposable email domains
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Format date for display
 * 
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
function formatDate(date, options = {}) {
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        }).format(dateObj);
    } catch (error) {
        logError('Error formatting date', error);
        return 'Invalid date';
    }
}
