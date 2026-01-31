# Contributing to OpenGuild

First off, thank you for considering contributing to OpenGuild! 🎉

It's people like you that make OpenGuild such a great platform for builders worldwide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When reporting a bug, include:**
- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**
- Clear and descriptive title
- Detailed description of the proposed feature
- Why this enhancement would be useful
- Possible implementation approach

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `bug` - Something isn't working
- `enhancement` - New feature or request

---

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Setup Steps

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/openguild.git
   cd openguild
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/openguild.git
   ```

4. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

5. **Set up environment variables**
   
   Follow the instructions in [README.md](./README.md#getting-started)

6. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm run dev
   ```

---

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Test your changes**
   - Ensure the app runs without errors
   - Test all affected features
   - Check for console errors

3. **Follow coding standards** (see below)

4. **Update documentation** if needed

### Submitting the PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Description Should Include:**
   - What changes were made
   - Why these changes were necessary
   - How to test the changes
   - Screenshots (for UI changes)
   - Related issue numbers

### After Submitting

- Respond to review comments
- Make requested changes
- Keep your PR updated with main branch

---

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for new files
- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic

**Example:**
```typescript
// Good
const handleUserLogin = async (credentials: LoginCredentials) => {
  // Validate credentials before API call
  if (!credentials.email || !credentials.password) {
    throw new Error('Missing credentials');
  }
  
  return await authAPI.login(credentials);
};

// Bad
const h = async (c) => {
  return await authAPI.login(c);
};
```

### React Components

- One component per file
- Use descriptive component names
- Extract reusable logic into custom hooks
- Keep components small and focused

**Example:**
```typescript
// components/ui/UserCard.tsx
interface UserCardProps {
  user: User;
  onFollow: (userId: string) => void;
}

export function UserCard({ user, onFollow }: UserCardProps) {
  return (
    <Card>
      <h3>{user.displayName}</h3>
      <Button onClick={() => onFollow(user._id)}>
        Follow
      </Button>
    </Card>
  );
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the design system
- Keep custom CSS minimal
- Use responsive classes

**Example:**
```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-bg-secondary hover:bg-bg-tertiary transition-colors">
  {/* Content */}
</div>
```

### Backend Code

- Use async/await (not callbacks)
- Handle errors properly
- Validate input data
- Add JSDoc comments for functions

**Example:**
```javascript
/**
 * Creates a new project
 * @param {Object} projectData - Project details
 * @param {string} userId - ID of the user creating the project
 * @returns {Promise<Object>} Created project
 */
async function createProject(projectData, userId) {
  // Validate input
  if (!projectData.title || !projectData.description) {
    throw new Error('Missing required fields');
  }
  
  // Create project
  const project = new Project({
    ...projectData,
    createdBy: userId,
  });
  
  await project.save();
  return project;
}
```

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good
feat(auth): add Google OAuth integration
fix(chat): resolve WebSocket connection issue
docs(readme): update installation instructions

# Bad
update stuff
fixed bug
changes
```

### Detailed Example

```
feat(matching): implement AI-based project matching

- Add matching algorithm with skill compatibility scoring
- Implement goal alignment calculation
- Add diversity bonus for team composition
- Cache matching results in Redis

Closes #123
```

---

## File Organization

### Frontend

```
app/
├── (feature)/
│   ├── page.tsx          # Page component
│   ├── layout.tsx        # Layout (if needed)
│   └── loading.tsx       # Loading state

components/
└── ui/
    ├── Button.tsx        # Reusable components
    ├── Card.tsx
    └── ...

lib/
├── api.ts               # API client
├── utils.ts             # Utility functions
└── hooks/               # Custom hooks
```

### Backend

```
backend/
├── config/              # Configuration
├── models/              # MongoDB models
├── routes/              # API routes
├── middleware/          # Middleware
├── utils/               # Utilities
└── server.js           # Entry point
```

---

## Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Happy Path**
   - Feature works as expected
   - No console errors
   - UI looks correct

2. **Edge Cases**
   - Empty states
   - Error states
   - Loading states
   - Long text/data

3. **Responsive Design**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)

4. **Browser Compatibility**
   - Chrome
   - Firefox
   - Safari
   - Edge

### Automated Tests (Future)

We plan to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

---

## Documentation

### Code Comments

- Explain **why**, not **what**
- Document complex algorithms
- Add JSDoc for functions
- Keep comments up-to-date

### README Updates

Update README.md if you:
- Add new features
- Change setup process
- Add dependencies
- Modify environment variables

---

## Questions?

- **Discord**: [Join our Discord](https://discord.gg/openguild)
- **Email**: dev@openguild.dev
- **Issues**: [GitHub Issues](https://github.com/yourusername/openguild/issues)

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the app (for major contributions)

---

Thank you for contributing to OpenGuild! 🚀

**Let's build something amazing together!**
