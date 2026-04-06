# Contributing to AI Interview Coach

Thank you for your interest in contributing! This document provides guidelines for getting involved.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-interview-coach.git
   cd ai-interview-coach
   ```

3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

5. **Set up environment:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Add your ANTHROPIC_API_KEY to backend/.env
   ```

## Development Workflow

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Making Changes

1. **Create feature branch from main:**
   ```bash
   git checkout -b feature/descriptive-name
   ```

2. **Follow code style:**
   - Python: PEP 8 style guide
   - JavaScript/React: Prettier formatting
   - Use meaningful variable names
   - Add comments for complex logic

3. **Write/update tests:**
   ```bash
   # Backend
   python -m pytest backend/tests/
   
   # Frontend
   npm test
   ```

4. **Update documentation:**
   - Update README.md for user-facing changes
   - Update DEPLOYMENT.md for deployment changes
   - Add docstrings to new functions

### Commit Messages

Write clear, descriptive commit messages:

```
feat: Add voice recognition support
fix: Resolve CORS issue with backend
docs: Update deployment guide
style: Fix code formatting
refactor: Reorganize component structure
test: Add unit tests for evaluation
```

Format: `type: description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code reorganization
- `test`: Tests
- `chore`: Build/tooling

## Pull Request Process

1. **Before submitting:**
   - Ensure tests pass locally
   - Run linters
   - Update documentation
   - Rebase on latest main

2. **Create Pull Request:**
   - Use descriptive title and description
   - Reference related issues (#issue-number)
   - Include screenshots for UI changes
   - List changes and testing performed

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation
   
   ## How to Test
   1. Step 1
   2. Step 2
   
   ## Testing Performed
   - [ ] Unit tests
   - [ ] Manual testing
   - [ ] Cross-browser testing
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Respond to feedback:**
   - Address all comments
   - Request re-review after changes
   - Maintain professional tone

## Areas to Contribute

### Backend Enhancements
- [ ] Improve Claude prompt engineering
- [ ] Add more evaluation criteria
- [ ] Implement result caching
- [ ] Add more question variations
- [ ] Optimize database queries

### Frontend Improvements
- [ ] Add dark/light theme toggle
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts
- [ ] Enhance accessibility (a11y)
- [ ] Add more animations

### Features
- [ ] User authentication
- [ ] Session history visualization
- [ ] Export to PDF
- [ ] Video recording
- [ ] Peer comparison
- [ ] More interview types
- [ ] Question difficulty customization

### Documentation
- [ ] Add API documentation
- [ ] Create video tutorials
- [ ] Write blog posts
- [ ] Translate documentation
- [ ] Add architecture diagrams

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos if applicable
- Environment details (OS, browser, Python version)
- Error messages/logs

### Feature Requests

Include:
- Use case and problem statement
- Proposed solution
- Alternative solutions considered
- Examples from other products

## Code Review Guidelines

### For Reviewers
- Be constructive and respectful
- Explain the "why" behind suggestions
- Highlight what's done well
- Suggest improvements, don't demand
- Approve when satisfied

### For Authors
- Thank reviewers for feedback
- Ask clarifying questions if needed
- Make requested changes promptly
- Don't take criticism personally

## Testing Standards

### Python (Backend)
```bash
pip install pytest pytest-cov
pytest backend/ --cov=backend
```

### JavaScript (Frontend)
```bash
npm test
npm run build
```

## Style Guides

### Python PEP 8
```python
# Good
def evaluate_answer(question: str, answer: str) -> dict:
    """Evaluate the quality of an interview answer."""
    score = calculate_score(question, answer)
    return {"score": score}

# Avoid
def evaluate(q, a):
    s = calc_score(q, a)
    return {"s": s}
```

### JavaScript/React
```javascript
// Good
const AnswerForm = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};

// Avoid
function answerform(props) {
  let a = props.onSubmit
  return (
    <form onSubmit={()=>a(answer)}>
    </form>
  )
}
```

## Documentation Standards

### Docstrings (Python)
```python
def evaluate_answer(question: str, answer: str) -> dict:
    """
    Evaluate the quality of an interview answer.
    
    Args:
        question: The interview question asked
        answer: The candidate's response
        
    Returns:
        Dictionary containing evaluation metrics:
        - overall_score (1-10)
        - strengths (list)
        - improvements (list)
        
    Raises:
        ValueError: If question or answer is empty
    """
```

### JSDoc (JavaScript)
```javascript
/**
 * Generate a question for the specified role
 * @param {string} role - Job role (e.g., 'Frontend Developer')
 * @param {string} difficulty - Experience level (Fresher, Mid-level, Senior)
 * @returns {Promise<string>} The generated question
 * @throws {Error} If API call fails
 */
```

## Performance Considerations

- Frontend: Aim for < 3s load time
- Backend: API responses < 5s (except AI generation)
- Database: Use indexes for frequent queries
- AI calls: Cache results when possible

## Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize before storing in database
- Use HTTPS in production
- Keep dependencies updated

## Becoming a Contributor

Regular contributors can become maintainers with:
- 5+ merged PRs
- Demonstrated code quality
- Willingness to help others
- Understanding of project goals

## Questions?

- Open an issue with tag `question`
- Join our discussions
- Check existing issues/PRs

## License

By contributing, you agree your code is licensed under MIT License.

---

**Thank you for making AI Interview Coach better! 🎉**
