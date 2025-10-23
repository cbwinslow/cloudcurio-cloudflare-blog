# Contributing to CloudCurio

Thank you for your interest in contributing to CloudCurio! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cloudcurio-cloudflare-blog.git
   cd cloudcurio-cloudflare-blog
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up your local environment** (see SETUP.md)

## Development Workflow

### Making Changes

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Keep changes focused and atomic
   - Write clear commit messages

3. **Test your changes**
   ```bash
   npm run dev
   # Test locally at http://localhost:8788
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes

## Code Style Guidelines

### JavaScript

- Use ES6+ features
- Use `const` by default, `let` when reassignment is needed
- Use async/await instead of promises chains
- Use template literals for string interpolation
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Fetches blog posts from the database
 * @param {Object} env - Cloudflare environment bindings
 * @param {number} limit - Maximum number of posts to return
 * @returns {Promise<Array>} Array of blog posts
 */
async function getBlogPosts(env, limit = 50) {
    const { results } = await env.DB.prepare(`
        SELECT * FROM blog_posts LIMIT ?
    `).bind(limit).all();
    
    return results;
}
```

### HTML/CSS

- Use semantic HTML5 elements
- Follow BEM naming convention for CSS classes
- Keep CSS organized by component
- Use CSS custom properties for theming

### File Organization

```
/public/              - Static assets
  /css/               - Stylesheets
  /js/                - Client-side JavaScript
  /blog/              - Blog-related pages
  index.html          - Main entry point

/functions/           - Cloudflare Pages Functions
  /api/               - API endpoints
    /blog/            - Blog-related APIs
    /knowledge/       - Knowledge base APIs
    
/src/                 - Source code
  /workers/           - Background workers
  
/schema/              - Database schemas
/docs/                - Documentation
```

## Types of Contributions

### 🐛 Bug Fixes

- Check existing issues first
- Create an issue if one doesn't exist
- Reference the issue in your PR

### ✨ New Features

- Discuss major features in an issue first
- Keep features focused and well-documented
- Update relevant documentation

### 📚 Documentation

- Fix typos and clarify existing docs
- Add examples and use cases
- Keep documentation in sync with code

### 🎨 UI/UX Improvements

- Maintain responsive design
- Follow existing design patterns
- Test on multiple browsers/devices

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of changes completed
- [ ] Comments added for complex logic
- [ ] Documentation updated if needed
- [ ] Changes tested locally
- [ ] No console errors or warnings

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
How you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #(issue number)
```

## Feature Requests

Have an idea for a new feature? Create an issue with:

1. **Problem**: What problem does this solve?
2. **Proposed Solution**: How would you implement it?
3. **Alternatives**: Other approaches considered
4. **Additional Context**: Any other relevant information

## Bug Reports

Found a bug? Create an issue with:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: How to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: 
   - OS
   - Browser
   - Node version
   - Wrangler version

## Development Tips

### Local Development

```bash
# Run with live reload
npm run dev

# Test specific API endpoint
curl -X POST http://localhost:8788/api/blog/generate

# View D1 database locally
wrangler d1 execute knowledge_base --local --command="SELECT * FROM blog_posts"
```

### Debugging

1. Use `console.log()` for debugging (automatically appears in wrangler output)
2. Use browser DevTools for frontend debugging
3. Check Cloudflare dashboard for production issues

### Testing New Features

1. Test locally first
2. Deploy to a preview environment
3. Test all affected functionality
4. Verify no regressions

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be included in the next release

## Community

- Be respectful and constructive
- Help others when you can
- Follow the Code of Conduct
- Ask questions if you're unsure

## Recognition

All contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:
- Open an issue for discussion
- Ask in pull request comments
- Contact maintainers directly

---

Thank you for contributing to CloudCurio! 🚀
