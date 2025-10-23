// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupBlogSection();
    setupKnowledgeBase();
    setupChat();
    setupResearch();
    
    // Load initial blog posts
    loadBlogPosts();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Blog Section
function setupBlogSection() {
    document.getElementById('refresh-posts').addEventListener('click', loadBlogPosts);
    document.getElementById('generate-post').addEventListener('click', generateNewPost);
}

async function loadBlogPosts() {
    const blogGrid = document.getElementById('blog-posts');
    blogGrid.innerHTML = '<p>Loading blog posts...</p>';

    try {
        const response = await fetch('/api/blog/posts');
        const posts = await response.json();

        if (posts.length === 0) {
            blogGrid.innerHTML = '<p>No blog posts yet. Click "Generate New Post" to create one!</p>';
            return;
        }

        blogGrid.innerHTML = posts.map(post => `
            <div class="blog-post">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="meta">${new Date(post.date).toLocaleDateString()} • ${post.author || 'Anonymous'}</div>
                <div class="excerpt">${escapeHtml(post.excerpt)}</div>
                <button class="btn btn-primary" onclick="viewPost('${post.id}')">Read More</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        blogGrid.innerHTML = '<p>Error loading blog posts. Please try again.</p>';
    }
}

async function generateNewPost() {
    const button = document.getElementById('generate-post');
    button.disabled = true;
    button.textContent = 'Generating...';

    try {
        const response = await fetch('/api/blog/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        
        if (result.success) {
            alert('New post generated successfully!');
            loadBlogPosts();
        } else {
            alert('Failed to generate post: ' + result.error);
        }
    } catch (error) {
        console.error('Error generating post:', error);
        alert('Error generating post. Please try again.');
    } finally {
        button.disabled = false;
        button.textContent = 'Generate New Post';
    }
}

async function viewPost(postId) {
    try {
        const response = await fetch(`/api/blog/post/${postId}`);
        const post = await response.json();
        
        // Simple modal display (you could enhance this)
        alert(`${post.title}\n\n${post.content}`);
    } catch (error) {
        console.error('Error viewing post:', error);
        alert('Error loading post.');
    }
}

// Knowledge Base Section
function setupKnowledgeBase() {
    document.getElementById('add-to-kb').addEventListener('click', addToKnowledgeBase);
    document.getElementById('search-kb').addEventListener('click', searchKnowledgeBase);
}

async function addToKnowledgeBase() {
    const content = document.getElementById('kb-content').value;
    const title = document.getElementById('kb-title').value;

    if (!content || !title) {
        alert('Please enter both title and content.');
        return;
    }

    try {
        const response = await fetch('/api/knowledge/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Added to knowledge base successfully!');
            document.getElementById('kb-content').value = '';
            document.getElementById('kb-title').value = '';
        } else {
            alert('Failed to add to knowledge base: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding to KB:', error);
        alert('Error adding to knowledge base. Please try again.');
    }
}

async function searchKnowledgeBase() {
    const query = document.getElementById('kb-search-query').value;
    const resultsDiv = document.getElementById('kb-results');

    if (!query) {
        alert('Please enter a search query.');
        return;
    }

    resultsDiv.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No results found.</p>';
            return;
        }

        resultsDiv.innerHTML = results.map(result => `
            <div class="result-item">
                <h4>${escapeHtml(result.title)}</h4>
                <p>${escapeHtml(result.content.substring(0, 200))}...</p>
                <small>Relevance: ${(result.score * 100).toFixed(1)}%</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error searching KB:', error);
        resultsDiv.innerHTML = '<p>Error searching knowledge base. Please try again.</p>';
    }
}

// Chat Section
function setupChat() {
    const sendButton = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input');

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    const messagesDiv = document.getElementById('chat-messages');
    
    // Add user message
    addMessageToChat('user', message);
    input.value = '';

    // Add loading message
    const loadingId = Date.now();
    addMessageToChat('system', 'AI is thinking...', loadingId);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const result = await response.json();
        
        // Remove loading message
        document.getElementById(`msg-${loadingId}`)?.remove();
        
        // Add AI response
        addMessageToChat('assistant', result.response);
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error('Error sending message:', error);
        document.getElementById(`msg-${loadingId}`)?.remove();
        addMessageToChat('system', 'Error: Could not get response from AI.');
    }
}

function addMessageToChat(type, content, id = null) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    if (id) messageDiv.id = `msg-${id}`;
    messageDiv.textContent = content;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Research Tools Section
function setupResearch() {
    document.getElementById('start-research').addEventListener('click', startResearch);
}

async function startResearch() {
    const query = document.getElementById('research-query').value;
    const type = document.getElementById('research-type').value;
    const outputDiv = document.getElementById('research-output');

    if (!query) {
        alert('Please enter a research query.');
        return;
    }

    const button = document.getElementById('start-research');
    button.disabled = true;
    button.textContent = 'Researching...';
    outputDiv.innerHTML = '<p>AI agents are working on your research task...</p>';

    try {
        const response = await fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, type })
        });

        const result = await response.json();
        
        if (result.success) {
            outputDiv.innerHTML = `
                <div class="research-result">
                    <h4>${escapeHtml(result.title)}</h4>
                    <div>${escapeHtml(result.content)}</div>
                    ${result.sources ? `<div><strong>Sources:</strong> ${result.sources.join(', ')}</div>` : ''}
                </div>
            `;
        } else {
            outputDiv.innerHTML = `<p>Research failed: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error running research:', error);
        outputDiv.innerHTML = '<p>Error running research. Please try again.</p>';
    } finally {
        button.disabled = false;
        button.textContent = 'Start Research';
    }
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
