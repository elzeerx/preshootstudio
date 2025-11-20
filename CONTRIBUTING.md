# Contributing to PreShoot AI

This document contains development guidelines and instructions for maintaining consistency and quality in the PreShoot AI project.

## Project Overview

**PreShoot AI** - مساعدك الشخصي قبل التصوير وبعده

A comprehensive platform to help Arabic content creators prepare everything they need before and after filming - from research and scripts to B-Roll plans, prompts, and articles.

## Development Guidelines

### Workflow Rules

1. **لا تقم بتنفيذ أكثر من مهمة أو Feature رئيسي في نفس الوقت**
   - Work on one major task or feature at a time
   - Complete each task before moving to the next
   - Follow a step-by-step approach

2. **عندما نطلب ميزة جديدة، أنشئ خطة مختصرة في الكود أو في LOG قبل التنفيذ (Planning)**
   - Always plan before implementing new features
   - Document the plan in code comments or LOG.md
   - Break down complex features into smaller tasks

### Design Guidelines

3. **حافظ على أن اللغة الأساسية للمستخدم هي العربية والـ RTL**
   - User-facing content must be in Arabic
   - Maintain RTL (right-to-left) direction
   - Use proper Arabic typography

4. **استخدم دائمًا نفس Design System والألوان المعرفة**
   - Always use the defined Design System
   - Use semantic tokens from `index.css` instead of direct colors
   - Maintain consistency across all components

5. **استخدم semantic tokens من index.css بدلاً من الألوان المباشرة**
   - Use CSS variables defined in the design system
   - Example: `hsl(var(--primary))` instead of `#4C6FFF`
   - This ensures theme consistency

### Documentation Guidelines

6. **لا تغيّر README و LOG إلا عند طلب صريح مني بإضافة بند جديد**
   - Do not modify README.md or docs/LOG.md without explicit request
   - Only add new entries when specifically asked
   - Keep documentation accurate and up-to-date

### Code Quality

7. **اكتب التعليقات في الكود بالإنجليزية، والـ UI بالعربية**
   - Write code comments in English
   - User interface text in Arabic
   - Maintain this separation consistently

### Security

8. **جميع API Keys يتم إدارتها عبر environment variables في Lovable**
   - Never hardcode API keys
   - Use environment variables for all sensitive data
   - Follow Lovable's environment variable management

## Design System Reference

### Color Palette

- **Primary**: `#4C6FFF` - Main brand color
- **Secondary**: `#FFC857` - Accent color
- **Accent Green**: `#22C55E` - Success states
- **Accent Orange**: `#F97316` - Warning states

### Typography

- **Primary Font**: IBM Plex Sans Arabic
- **Fallback**: Inter
- **Direction**: RTL (Right-to-Left)

### AI Integration

- **OpenAI GPT-5**
- **Anthropic Claude**
- **API Keys**: Managed via Environment Variables

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install` or `bun install`
3. Set up environment variables in Lovable
4. Run development server: `npm run dev` or `bun dev`

## Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Maintain consistent file structure
- Use semantic HTML elements

## Testing

- Test all routes and navigation
- Verify RTL layout on all pages
- Check responsive design on different screen sizes
- Test authentication flows
- Verify API integrations

## Questions?

For more details, refer to:
- `README.md` - Project overview and features
- `docs/LOG.md` - Development history and missions

